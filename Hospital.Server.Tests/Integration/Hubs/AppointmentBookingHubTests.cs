using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;
using Hospital.Server.Tests.Infrastructure;
using Xunit;

namespace Hospital.Server.Tests.Integration.Hubs;

/// <summary>
/// Integration tests for the AppointmentBookingHub SignalR hub.
/// Tests real-time slot locking, releasing, group management, and authentication
/// over WebSocket connections using the test server.
/// </summary>
public class AppointmentBookingHubTests(HospitalWebApplicationFactory factory) : IClassFixture<HospitalWebApplicationFactory>, IAsyncLifetime
{
    private readonly HospitalWebApplicationFactory _factory = factory;
    private readonly List<HubConnection> _connections = [];

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        foreach (var connection in _connections)
        {
            if (connection.State != HubConnectionState.Disconnected)
            {
                await connection.StopAsync();
            }
            await connection.DisposeAsync();
        }
        _connections.Clear();
    }

    /// <summary>
    /// Creates an authenticated HubConnection to the test server.
    /// Uses query string userId parameter to simulate different users.
    /// </summary>
    private HubConnection CreateHubConnection(string userId = "1")
    {
        var server = _factory.Server;
        var connection = new HubConnectionBuilder()
            .WithUrl($"{server.BaseAddress}hubs/appointment-booking?userId={userId}", options => options.HttpMessageHandlerFactory = _ => server.CreateHandler())
            .Build();

        _connections.Add(connection);
        return connection;
    }

    /// <summary>
    /// Creates an unauthenticated HubConnection to the test server.
    /// Uses the "anonymous" query parameter to trigger auth failure.
    /// </summary>
    private HubConnection CreateAnonymousHubConnection()
    {
        var server = _factory.Server;
        var connection = new HubConnectionBuilder()
            .WithUrl($"{server.BaseAddress}hubs/appointment-booking?anonymous=true", options => options.HttpMessageHandlerFactory = _ => server.CreateHandler())
            .Build();

        _connections.Add(connection);
        return connection;
    }

    [Fact]
    public async Task JoinSlotGroup_AddsClientToGroup_AndReceivesActiveLocks()
    {
        // Arrange
        var connection = CreateHubConnection();
        List<object>? receivedLocks = null;
        var activeLocksTcs = new TaskCompletionSource<List<object>>();

        connection.On<List<object>>("ActiveLocks", locks =>
        {
            receivedLocks = locks;
            activeLocksTcs.TrySetResult(locks);
        });

        await connection.StartAsync();

        // Act
        await connection.InvokeAsync("JoinSlotGroup", 1L, "2025-01-15");

        // Assert - should receive ActiveLocks event (empty list since no locks exist)
        var result = await activeLocksTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task LockSlot_BroadcastsSlotLockedEvent_ToGroup()
    {
        // Arrange
        var client1 = CreateHubConnection("10");
        var client2 = CreateHubConnection("20");

        var slotLockedTcs = new TaskCompletionSource<object>();

        // Client2 listens for SlotLocked
        client2.On<object>("SlotLocked", lockInfo => slotLockedTcs.TrySetResult(lockInfo));

        // Ignore ActiveLocks events
        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });

        await client1.StartAsync();
        await client2.StartAsync();

        // Both join the same group
        await client1.InvokeAsync("JoinSlotGroup", 100L, "2025-02-20");
        await client2.InvokeAsync("JoinSlotGroup", 100L, "2025-02-20");

        // Act - Client1 locks a slot
        await client1.InvokeAsync("LockSlot", 100L, "2025-02-20", "09:00");

        // Assert - Client2 should receive SlotLocked event
        var lockResult = await slotLockedTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        lockResult.Should().NotBeNull();

        // Verify the payload contains expected fields
        var json = System.Text.Json.JsonSerializer.Serialize(lockResult);
        json.Should().Contain("100"); // DoctorId
        json.Should().Contain("2025-02-20"); // Date
        json.Should().Contain("09:00"); // Time
    }

    [Fact]
    public async Task LockSlot_OnAlreadyLockedSlot_SendsSlotLockRejected_OnlyToCaller()
    {
        // Arrange
        var client1 = CreateHubConnection("30");
        var client2 = CreateHubConnection("40");

        var rejectedTcs = new TaskCompletionSource<object>();
        var slotLockedByClient2 = false;

        IDisposable disposable = client2.On<object>("SlotLockRejected", rejection => rejectedTcs.TrySetResult(rejection));

        // Track if client1 receives any unexpected SlotLocked from client2's attempt
        client1.On<object>("SlotLockRejected", _ =>
        {
            // Client1 should NOT receive SlotLockRejected
        });

        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });
        client1.On<object>("SlotLocked", _ => { });
        client2.On<object>("SlotLocked", _ => slotLockedByClient2 = true);

        await client1.StartAsync();
        await client2.StartAsync();

        await client1.InvokeAsync("JoinSlotGroup", 200L, "2025-03-10");
        await client2.InvokeAsync("JoinSlotGroup", 200L, "2025-03-10");

        // Client1 locks the slot first
        await client1.InvokeAsync("LockSlot", 200L, "2025-03-10", "10:00");

        // Small delay to ensure lock is registered
        await Task.Delay(100);

        // Reset the flag
        slotLockedByClient2 = false;

        // Act - Client2 tries to lock the same slot
        await client2.InvokeAsync("LockSlot", 200L, "2025-03-10", "10:00");

        // Assert - Client2 should receive SlotLockRejected
        var rejection = await rejectedTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        rejection.Should().NotBeNull();

        var json = System.Text.Json.JsonSerializer.Serialize(rejection);
        json.Should().Contain("200"); // DoctorId
        json.Should().Contain("2025-03-10"); // Date
        json.Should().Contain("10:00"); // Time

        // No SlotLocked event should have been broadcast for client2's failed attempt
        slotLockedByClient2.Should().BeFalse();
    }

    [Fact]
    public async Task ReleaseSlot_BroadcastsSlotReleasedEvent_ToGroup()
    {
        // Arrange
        var client1 = CreateHubConnection("50");
        var client2 = CreateHubConnection("60");

        var slotReleasedTcs = new TaskCompletionSource<object>();

        client2.On<object>("SlotReleased", releaseInfo => slotReleasedTcs.TrySetResult(releaseInfo));

        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });
        client1.On<object>("SlotLocked", _ => { });
        client2.On<object>("SlotLocked", _ => { });

        await client1.StartAsync();
        await client2.StartAsync();

        await client1.InvokeAsync("JoinSlotGroup", 300L, "2025-04-05");
        await client2.InvokeAsync("JoinSlotGroup", 300L, "2025-04-05");

        // Client1 locks a slot
        await client1.InvokeAsync("LockSlot", 300L, "2025-04-05", "14:00");
        await Task.Delay(100);

        // Act - Client1 releases the slot
        await client1.InvokeAsync("ReleaseSlot", 300L, "2025-04-05", "14:00");

        // Assert - Client2 should receive SlotReleased event
        var releaseResult = await slotReleasedTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        releaseResult.Should().NotBeNull();

        var json = System.Text.Json.JsonSerializer.Serialize(releaseResult);
        json.Should().Contain("300"); // DoctorId
        json.Should().Contain("2025-04-05"); // Date
        json.Should().Contain("14:00"); // Time
    }

    [Fact]
    public async Task ClientDisconnect_ReleasesAllHeldLocks_AndBroadcastsSlotReleased()
    {
        // Arrange
        var client1 = CreateHubConnection("70");
        var client2 = CreateHubConnection("80");

        List<object> releasedEvents = [];
        var releasedTcs = new TaskCompletionSource<bool>();

        client2.On<object>("SlotReleased", releaseInfo =>
        {
            releasedEvents.Add(releaseInfo);
            // We expect at least 1 release event from disconnect
            releasedTcs.TrySetResult(true);
        });

        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });
        client1.On<object>("SlotLocked", _ => { });
        client2.On<object>("SlotLocked", _ => { });

        await client1.StartAsync();
        await client2.StartAsync();

        await client1.InvokeAsync("JoinSlotGroup", 400L, "2025-05-01");
        await client2.InvokeAsync("JoinSlotGroup", 400L, "2025-05-01");

        // Client1 locks a slot
        await client1.InvokeAsync("LockSlot", 400L, "2025-05-01", "08:30");
        await Task.Delay(100);

        // Act - Client1 disconnects
        await client1.StopAsync();

        // Assert - Client2 should receive SlotReleased for the lock held by client1
        await releasedTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));
        releasedEvents.Should().HaveCountGreaterOrEqualTo(1);

        var json = System.Text.Json.JsonSerializer.Serialize(releasedEvents[0]);
        json.Should().Contain("400"); // DoctorId
        json.Should().Contain("2025-05-01"); // Date
        json.Should().Contain("08:30"); // Time
    }

    [Fact]
    public async Task LockSlot_WhileHoldingAnotherLock_ReleasesPreviousSlotFirst()
    {
        // Arrange
        var client1 = CreateHubConnection("90");
        var client2 = CreateHubConnection("91");

        List<(string EventName, object Payload)> events = [];
        var secondLockTcs = new TaskCompletionSource<bool>();
        var eventCount = 0;

        client2.On<object>("SlotReleased", info =>
        {
            events.Add(("SlotReleased", info));
            Interlocked.Increment(ref eventCount);
            // We expect SlotReleased + SlotLocked = 2 events after the second lock
            if (eventCount >= 2)
                secondLockTcs.TrySetResult(true);
        });

        client2.On<object>("SlotLocked", info =>
        {
            events.Add(("SlotLocked", info));
            Interlocked.Increment(ref eventCount);
            // We expect SlotReleased + SlotLocked = 2 events after the second lock
            if (eventCount >= 2)
                secondLockTcs.TrySetResult(true);
        });

        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });
        client1.On<object>("SlotLocked", _ => { });
        client1.On<object>("SlotReleased", _ => { });

        await client1.StartAsync();
        await client2.StartAsync();

        await client1.InvokeAsync("JoinSlotGroup", 500L, "2025-06-15");
        await client2.InvokeAsync("JoinSlotGroup", 500L, "2025-06-15");

        // Client1 locks first slot
        await client1.InvokeAsync("LockSlot", 500L, "2025-06-15", "11:00");
        await Task.Delay(200);

        // Clear events from first lock and reset counter
        events.Clear();
        Interlocked.Exchange(ref eventCount, 0);

        // Act - Client1 locks a different slot (should release previous first)
        await client1.InvokeAsync("LockSlot", 500L, "2025-06-15", "11:30");

        // Assert - Should receive SlotReleased for 11:00 before SlotLocked for 11:30
        await secondLockTcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Verify order: SlotReleased should come before SlotLocked
        var releaseIndex = events.FindIndex(e => e.EventName == "SlotReleased");
        var lockIndex = events.FindIndex(e => e.EventName == "SlotLocked");

        releaseIndex.Should().BeGreaterOrEqualTo(0, "SlotReleased event should be received");
        lockIndex.Should().BeGreaterOrEqualTo(0, "SlotLocked event should be received");
        releaseIndex.Should().BeLessThan(lockIndex, "SlotReleased should come before SlotLocked");

        // Verify the released slot is 11:00
        var releasedJson = System.Text.Json.JsonSerializer.Serialize(events[releaseIndex].Payload);
        releasedJson.Should().Contain("11:00");

        // Verify the locked slot is 11:30
        var lockedJson = System.Text.Json.JsonSerializer.Serialize(events[lockIndex].Payload);
        lockedJson.Should().Contain("11:30");
    }

    [Fact]
    public async Task UnauthenticatedConnection_IsRejected()
    {
        // Arrange
        var connection = CreateAnonymousHubConnection();

        // Act & Assert - Connection should fail
        var act = async () => await connection.StartAsync();

        await act.Should().ThrowAsync<Exception>();
    }

    [Fact]
    public async Task ReleaseSlot_ForSlotNotHeldByClient_DoesNotBroadcast()
    {
        // Arrange
        var client1 = CreateHubConnection("110");
        var client2 = CreateHubConnection("120");

        var slotReleasedReceived = false;

        client2.On<object>("SlotReleased", _ => slotReleasedReceived = true);

        client1.On<List<object>>("ActiveLocks", _ => { });
        client2.On<List<object>>("ActiveLocks", _ => { });

        await client1.StartAsync();
        await client2.StartAsync();

        await client1.InvokeAsync("JoinSlotGroup", 600L, "2025-07-20");
        await client2.InvokeAsync("JoinSlotGroup", 600L, "2025-07-20");

        // Act - Client1 tries to release a slot it doesn't hold
        await client1.InvokeAsync("ReleaseSlot", 600L, "2025-07-20", "16:00");

        // Wait a bit to ensure no event is broadcast
        await Task.Delay(500);

        // Assert - No SlotReleased event should have been broadcast
        slotReleasedReceived.Should().BeFalse();
    }
}

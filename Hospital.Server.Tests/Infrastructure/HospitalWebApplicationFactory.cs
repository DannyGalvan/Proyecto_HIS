using Hospital.Server.Context;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Hospital.Server.Tests.Infrastructure;

/// <summary>
/// Custom WebApplicationFactory that replaces the production database with an in-memory
/// database and configures a test authentication scheme. This allows integration tests
/// to simulate authenticated requests without an external identity provider.
/// </summary>
public class HospitalWebApplicationFactory : WebApplicationFactory<Program>
{
    private List<string> _operationKeys = [];
    private readonly string _databaseName = "TestDb_" + Guid.NewGuid();

    /// <summary>
    /// Configures specific OperationKey claims for the test user, allowing individual
    /// tests to control which policy-based authorization checks will pass.
    /// </summary>
    /// <param name="keys">The operation keys to include (e.g., "User.GetAll.GET")</param>
    /// <returns>The factory instance for fluent chaining</returns>
    public HospitalWebApplicationFactory WithOperationKeys(params string[] keys)
    {
        _operationKeys = [.. keys];
        return this;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove the production DataContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<DataContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Remove any existing DataContext registrations (AddDbContext registers multiple)
            var dbContextDescriptors = services
                .Where(d => d.ServiceType == typeof(DataContext)
                         || d.ServiceType == typeof(DbContextOptions<DataContext>)
                         || d.ServiceType == typeof(DbContextOptions))
                .ToList();
            foreach (var d in dbContextDescriptors)
                services.Remove(d);

            // Add in-memory database for testing
            services.AddDbContext<DataContext>(options =>
                options.UseInMemoryDatabase(_databaseName)
                    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)));

            // Remove hosted services that depend on real infrastructure
            var hostedServiceDescriptors = services
                .Where(d => d.ServiceType == typeof(IHostedService))
                .ToList();
            foreach (var d in hostedServiceDescriptors)
                services.Remove(d);

            // Configure test auth options with operation keys
            services.Configure<TestAuthOptions>(opts => opts.OperationKeys = _operationKeys);
        });

        // ConfigureTestServices runs AFTER the app's ConfigureServices,
        // ensuring our test auth scheme overrides the production JWT Bearer scheme
        builder.ConfigureTestServices(services =>
        {
            // Replace authentication with test scheme
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", null);

            // Ensure the test scheme is the default even if prior configuration set Bearer
            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            });
        });

        builder.UseEnvironment("Development");
    }
}

using Hospital.Server.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Hospital.Server.Tests.Infrastructure
{
    /// <summary>
    /// Base class for unit tests that require an in-memory database.
    /// Each test gets a unique database instance to ensure isolation.
    /// </summary>
    public abstract class TestBase : IDisposable
    {
        protected DataContext DbContext { get; }

        protected TestBase()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            DbContext = new DataContext(options);
        }

        public void Dispose()
        {
            DbContext.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}

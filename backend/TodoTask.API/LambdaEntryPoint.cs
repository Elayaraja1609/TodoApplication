using Amazon.Lambda.AspNetCoreServer;
using Microsoft.AspNetCore.Hosting;

namespace TodoTask.API
{
    /// <summary>
    /// Lambda entry point for the Todo Task API
    /// This class extends APIGatewayHttpApiV2ProxyFunction to handle API Gateway requests
    /// </summary>
    public class LambdaEntryPoint : APIGatewayHttpApiV2ProxyFunction
    {
        /// <summary>
        /// Initialize the web host builder for Lambda
        /// Note: If using Program.cs (minimal hosting), you may need to refactor to use Startup.cs
        /// or use a different Lambda hosting approach
        /// </summary>
        protected override void Init(IWebHostBuilder builder)
        {
            // Option 1: Use Startup.cs (if available)
            // builder.UseStartup<Startup>();
            
            // Option 2: Configure directly (for minimal hosting)
            builder
                .UseStartup<Startup>()
                .ConfigureAppConfiguration((context, config) =>
                {
                    // Add Lambda-specific configuration
                    config.AddEnvironmentVariables();
                });
        }
    }
}


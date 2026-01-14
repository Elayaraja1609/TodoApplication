using Amazon.Lambda.Core;
using Amazon.Lambda.SNSEvents;
using System;
using System.Threading.Tasks;
using System.Text.Json;
using System.Net.Http;
using System.Text;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TodoTask.ReminderJob
{
    public class ReminderJob
    {
        private readonly HttpClient _httpClient;
        private readonly string _databaseConnectionString;
        private readonly string _snsTopicArn;
        private readonly string _firebaseServerKey;

        public ReminderJob()
        {
            _httpClient = new HttpClient();
            // Retrieve from Secrets Manager or Environment Variables
            _databaseConnectionString = Environment.GetEnvironmentVariable("Database__ConnectionString") 
                ?? throw new InvalidOperationException("Database connection string not found");
            _snsTopicArn = Environment.GetEnvironmentVariable("SNS__TopicArn");
            _firebaseServerKey = Environment.GetEnvironmentVariable("Firebase__ServerKey");
        }

        /// <summary>
        /// Lambda function handler for reminder job
        /// Triggered by EventBridge on a daily schedule
        /// </summary>
        public async Task<string> FunctionHandler(ILambdaContext context)
        {
            context.Logger.LogLine("Reminder job started");

            try
            {
                // TODO: Query database for reminders due in the next hour
                // var reminders = await GetRemindersDueSoon();

                // TODO: For each reminder:
                // 1. Get user's device tokens
                // 2. Send push notification via SNS or Firebase
                // 3. Update reminder status

                context.Logger.LogLine("Reminder job completed successfully");
                return "Reminder job completed";
            }
            catch (Exception ex)
            {
                context.Logger.LogLine($"Error in reminder job: {ex.Message}");
                context.Logger.LogLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        /// <summary>
        /// Send push notification via AWS SNS
        /// </summary>
        private async Task SendSNSNotification(string deviceToken, string title, string body)
        {
            // TODO: Implement SNS notification sending
            // Use AmazonSimpleNotificationServiceClient to publish to SNS topic
        }

        /// <summary>
        /// Send push notification via Firebase Cloud Messaging
        /// </summary>
        private async Task SendFCMNotification(string deviceToken, string title, string body)
        {
            if (string.IsNullOrEmpty(_firebaseServerKey))
            {
                throw new InvalidOperationException("Firebase server key not configured");
            }

            var fcmUrl = "https://fcm.googleapis.com/fcm/send";
            var payload = new
            {
                to = deviceToken,
                notification = new
                {
                    title = title,
                    body = body,
                    sound = "default"
                },
                priority = "high"
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"key={_firebaseServerKey}");

            var response = await _httpClient.PostAsync(fcmUrl, content);
            response.EnsureSuccessStatusCode();
        }
    }
}


param(
    [string]$TestBaseUrl = "http://localhost:8081"
)

$ErrorActionPreference = "Stop"

$env:MYSQLHOST = "localhost"
$env:MYSQLPORT = "3306"
$env:MYSQLDATABASE = "todo_test"
$env:MYSQLUSER = "root"
$env:MYSQLPASSWORD = "root"
$env:TEST_BASE_URL = $TestBaseUrl
$env:SELENIUM_HEADLESS = "true"

dotnet test ../TodoTask.sln --filter "FullyQualifiedName~IntegrationTests"
dotnet test ../TodoTask.sln --filter "FullyQualifiedName~UI.SmokeTests"

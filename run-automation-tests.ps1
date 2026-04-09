param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

if (-not $FrontendOnly) {
    Push-Location "backend/tests"
    try {
        ./run-backend-tests.ps1
    } finally {
        Pop-Location
    }
}

if (-not $BackendOnly) {
    Push-Location "frontend"
    try {
        npm run e2e:web
    } finally {
        Pop-Location
    }
}

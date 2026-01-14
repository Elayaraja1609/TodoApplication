namespace TodoTask.Application.DTOs.Auth;

public class SetupPinRequest
{
    public string Pin { get; set; } = string.Empty;
    public string ConfirmPin { get; set; } = string.Empty;
}

public class VerifyPinRequest
{
    public string Pin { get; set; } = string.Empty;
}

public class ChangePinRequest
{
    public string CurrentPin { get; set; } = string.Empty;
    public string NewPin { get; set; } = string.Empty;
    public string ConfirmPin { get; set; } = string.Empty;
}


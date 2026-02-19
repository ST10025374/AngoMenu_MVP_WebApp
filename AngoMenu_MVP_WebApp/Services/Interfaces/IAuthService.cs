using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface IAuthService
    {
        Task<Result> RegisterAsync(RegisterDto dto);
        Task<Result<string>> LoginAsync(LoginDto dto); // token as Data
    }
}

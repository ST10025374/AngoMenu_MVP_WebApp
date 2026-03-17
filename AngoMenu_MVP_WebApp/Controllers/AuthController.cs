using AngoMenu_MVP_WebApp.Common;
using AngoMenu_MVP_WebApp.DTOs;
using AngoMenu_MVP_WebApp.Models;
using AngoMenu_MVP_WebApp.Models.Enums;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }

        [EnableRateLimiting("loginLimiter")]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);

            if (!result.Success)
            {
                // lockout -> BadRequest; invalid creds -> Unauthorized
                if (result.Message == "Account is temporarily locked. Try again later.")
                    return BadRequest(result.Message);

                return Unauthorized(result.Message);
            }

            return Ok(new { token = result.Data });
        }
    }
}

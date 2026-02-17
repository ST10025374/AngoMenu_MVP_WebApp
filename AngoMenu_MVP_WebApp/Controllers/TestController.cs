using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AngoMenu_MVP_WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("crash")]
        public IActionResult Crash()
        {
            throw new Exception("Forced test exception.");
        }
    }
}

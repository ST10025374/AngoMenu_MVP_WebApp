namespace AngoMenu_MVP_WebApp.Middleware
{
    /// <summary>
    /// Ensures all text/json responses explicitly declare charset=utf-8.
    /// Placed early in the pipeline so the header is set before the body is written.
    /// </summary>
    public class Utf8CharsetMiddleware
    {
        private readonly RequestDelegate _next;

        public Utf8CharsetMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            // Hook into OnStarting so we can still mutate headers before they're sent
            context.Response.OnStarting(() =>
            {
                var contentType = context.Response.ContentType;

                if (string.IsNullOrWhiteSpace(contentType))
                    return Task.CompletedTask;

                if (contentType.Contains("charset=", StringComparison.OrdinalIgnoreCase))
                    return Task.CompletedTask;

                if (contentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase) ||
                    contentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
                    contentType.StartsWith("application/javascript", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.ContentType = $"{contentType}; charset=utf-8";
                }

                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
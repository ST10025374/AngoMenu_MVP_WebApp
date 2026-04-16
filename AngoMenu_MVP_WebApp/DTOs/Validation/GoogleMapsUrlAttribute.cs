using System.ComponentModel.DataAnnotations;

namespace AngoMenu_MVP_WebApp.DTOs.Validation
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public sealed class GoogleMapsUrlAttribute : ValidationAttribute
    {
        public GoogleMapsUrlAttribute()
        {
            ErrorMessage = "GoogleMapsUrl must be a valid Google Maps URL.";
        }

        public override bool IsValid(object? value)
        {
            if (value is null)
            {
                return true;
            }

            if (value is not string rawValue)
            {
                return false;
            }

            var url = rawValue.Trim();
            if (string.IsNullOrWhiteSpace(url))
            {
                return true;
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                return false;
            }

            if (!string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase)
                && !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var host = uri.Host.ToLowerInvariant();
            var path = uri.AbsolutePath.ToLowerInvariant();

            var isGoogleMapsHost =
                host == "maps.google.com"
                || host.EndsWith(".maps.google.com")
                || (host.EndsWith(".google.com") && path.StartsWith("/maps"))
                || host == "www.google.com" && path.StartsWith("/maps")
                || host == "goo.gl" && path.StartsWith("/maps")
                || host == "maps.app.goo.gl";

            return isGoogleMapsHost;
        }
    }
}
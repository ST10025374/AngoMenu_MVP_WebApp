using AngoMenu_MVP_WebApp.Configuration;
using AngoMenu_MVP_WebApp.Services.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace AngoMenu_MVP_WebApp.Services.Cloudinary
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly CloudinaryDotNet.Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> cloudinarySettings)
        {
            var settings = cloudinarySettings.Value;
            var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);

            _cloudinary = new CloudinaryDotNet.Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<ImageUploadResult> UploadRestaurantImage(IFormFile imageFile)
        {
            await using var stream = imageFile.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                Folder = "restaurants",
                PublicId = $"restaurant_{Guid.NewGuid():N}"
            };

            return await _cloudinary.UploadAsync(uploadParams);
        }

        public async Task<DeletionResult> DeleteImage(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                return new DeletionResult();
            }

            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            return await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}

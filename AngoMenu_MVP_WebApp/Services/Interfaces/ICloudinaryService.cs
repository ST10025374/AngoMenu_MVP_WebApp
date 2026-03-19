using CloudinaryDotNet.Actions;

namespace AngoMenu_MVP_WebApp.Services.Interfaces
{
    public interface ICloudinaryService
    {
        Task<ImageUploadResult> UploadRestaurantImage(IFormFile imageFile);
        Task<DeletionResult> DeleteImage(string publicId);
    }
}

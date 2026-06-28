/**
 * Upload image to Cloudinary
 * @param file - Image file to upload
 * @returns Promise with Cloudinary URL or null if upload fails
 */
export async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'recipechain'); // You'll need to create this in Cloudinary dashboard

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error('Cloudinary upload failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.secure_url; // Returns the HTTPS URL of the uploaded image
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

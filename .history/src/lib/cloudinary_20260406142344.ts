/**
 * Upload image to Cloudinary
 * @param file - Image file to upload
 * @returns Promise with Cloudinary URL or null if upload fails
 */
export async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    console.log('Starting Cloudinary upload for file:', file.name, 'Size:', file.size);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'recipechain'); // You'll need to create this in Cloudinary dashboard

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    console.log('Cloud name:', cloudName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Cloudinary response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Cloudinary upload success:', data.secure_url);
    return data.secure_url; // Returns the HTTPS URL of the uploaded image
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

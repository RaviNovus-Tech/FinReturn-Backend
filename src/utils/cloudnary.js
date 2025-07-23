import { v2 as cloudinary } from "cloudinary";

// Debug Cloudinary configuration
console.log("Cloudinary Config:", cloudinary.config());

export const uploadImageToCloudinary = async (
  fileBuffer,
  options = {},
  retries = 3
) => {
  try {
    // If no file is provided, return null (optional upload)
    if (!fileBuffer) {
      return null;
    }

    // Default options for payment proof images
    const uploadOptions = {
      resource_type: "image",
      folder: "payment_proofs",
      timeout: 30000, // Set timeout to 30 seconds (adjust as needed)
      ...options,
    };

    // Retry logic for upload
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) return reject(error);
              resolve(result);
            })
            .end(fileBuffer);
        });

        // Return relevant details from the upload result
        return {
          public_id: result.public_id,
          url: result.secure_url,
          asset_id: result.asset_id,
        };
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          throw new Error(
            `Failed to upload image to Cloudinary after ${retries} attempts: ${error.message}`
          );
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError; // Should not reach here, but ensures error is thrown if retries fail
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

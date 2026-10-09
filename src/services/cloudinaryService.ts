import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary is configured via environment variables
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  return Boolean((cloudName && apiKey && apiSecret) || cloudinaryUrl);
}

// Initialize Cloudinary SDK
export function initCloudinary(): boolean {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  try {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    return true;
  } catch (err) {
    console.error('[Cloudinary] Failed to initialize config:', err);
    return false;
  }
}

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  isCloudinary: boolean;
}

/**
 * Uploads a base64 or file path to Cloudinary
 * Automatically detects whether file is an image or PDF/raw file
 */
export async function uploadToCloudinary(
  fileData: string, // base64 string or URI
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: 'auto' | 'image' | 'raw';
  } = {}
): Promise<CloudinaryUploadResult | null> {
  if (!isCloudinaryConfigured()) {
    return null;
  }

  initCloudinary();

  try {
    const isPdf = fileData.startsWith('data:application/pdf') || options.resourceType === 'raw';
    
    // Ensure data URI format if base64 provided without prefix
    let uploadPayload = fileData;
    if (!uploadPayload.startsWith('data:') && !uploadPayload.startsWith('http')) {
      uploadPayload = `data:image/jpeg;base64,${fileData}`;
    }

    const uploadOptions: any = {
      folder: options.folder || 'mediprep_uploads',
      resource_type: isPdf ? 'auto' : (options.resourceType || 'auto'),
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    const result = await cloudinary.uploader.upload(uploadPayload, uploadOptions);

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      isCloudinary: true,
    };
  } catch (err: any) {
    console.error('[Cloudinary] Upload failed, falling back to local storage:', err?.message || err);
    return null;
  }
}

/**
 * Gets Cloudinary status summary (safely hides secrets)
 */
export function getCloudinaryStatus() {
  const configured = isCloudinaryConfigured();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || (process.env.CLOUDINARY_URL ? 'From CLOUDINARY_URL' : '');
  
  return {
    configured,
    cloudName: cloudName ? `${cloudName.substring(0, 3)}***` : 'Not configured',
    hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL),
    hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL),
    statusText: configured ? 'Cloudinary Connected & Active (Permanent Cloud CDN)' : 'Cloudinary Not Configured (Using Local Fallback)',
  };
}

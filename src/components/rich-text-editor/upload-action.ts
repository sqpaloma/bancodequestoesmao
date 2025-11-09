'use server';

import ImageKit from 'imagekit';
import sharp from 'sharp';

// Validate environment variables
function validateImageKitConfig() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      'ImageKit configuration is missing. Please check environment variables.',
    );
  }

  return { publicKey, privateKey, urlEndpoint };
}

// Lazy initialization of ImageKit
let imageKitInstance: ImageKit | null = null;

function getImageKit() {
  if (!imageKitInstance) {
    const config = validateImageKitConfig();
    imageKitInstance = new ImageKit(config);
  }
  return imageKitInstance;
}

// Image optimization constants
const IMAGE_OPTIMIZATION = {
  FORMAT: 'webp',
  QUALITY: 80, // 80% quality - good balance between size and quality
  MAX_WIDTH: 500, // 500px max width for content images
} as const;

export async function uploadToImageKit(file: File) {
  try {
    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Invalid file provided');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const arrayBuffer = await file.arrayBuffer();

    // Optimize image before upload
    const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .webp({ quality: IMAGE_OPTIMIZATION.QUALITY })
      .resize(IMAGE_OPTIMIZATION.MAX_WIDTH, undefined, {
        withoutEnlargement: true,
      })
      .toBuffer();

    const imageKit = getImageKit();
    const response = await imageKit.upload({
      file: optimizedBuffer,
      fileName: `${file.name.split('.')[0]}.${IMAGE_OPTIMIZATION.FORMAT}`,
      useUniqueFileName: true,
    });

    return response.url;
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw new TypeError(`Image upload failed: ${error.message}`);
    }
    throw new Error('Image upload failed: Unknown error');
  }
}

// Server-side proxy function to fetch external images
export async function fetchExternalImage(url: string) {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }

    // Fetch the image server-side (no CORS issues here)
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize the image
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: IMAGE_OPTIMIZATION.QUALITY })
      .resize(IMAGE_OPTIMIZATION.MAX_WIDTH, undefined, {
        withoutEnlargement: true,
      })
      .toBuffer();

    // Upload directly to ImageKit
    const imageKit = getImageKit();
    const filename = url.split('/').pop() || 'external-image.jpg';
    const response2 = await imageKit.upload({
      file: optimizedBuffer,
      fileName: `${filename.split('.')[0]}.${IMAGE_OPTIMIZATION.FORMAT}`,
      useUniqueFileName: true,
    });

    // Return the ImageKit URL
    return response2.url;
  } catch (error) {
    console.error('External image fetch failed:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw new TypeError(`External image fetch failed: ${error.message}`);
    }
    throw new Error('External image fetch failed: Unknown error');
  }
}

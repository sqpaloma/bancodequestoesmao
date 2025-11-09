'use server';

import ImageKit from 'imagekit';
import sharp from 'sharp';

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Image optimization constants
const IMAGE_OPTIMIZATION = {
  FORMAT: 'webp',
  QUALITY: 80, // 80% quality - good balance between size and quality
  MAX_WIDTH: 500, // 500px max width for content images
} as const;

export async function uploadToImageKit(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  // Optimize image before upload
  const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
    .webp({ quality: IMAGE_OPTIMIZATION.QUALITY })
    .resize(IMAGE_OPTIMIZATION.MAX_WIDTH, undefined, {
      withoutEnlargement: true,
    })
    .toBuffer();

  try {
    const response = await imageKit.upload({
      file: optimizedBuffer,
      fileName: `${file.name.split('.')[0]}.${IMAGE_OPTIMIZATION.FORMAT}`,
      useUniqueFileName: true,
    });

    return response.url;
  } catch (error) {
    console.error('ImageKit upload failed:', error);
    throw error;
  }
}

// Server-side proxy function to fetch external images
export async function fetchExternalImage(url: string) {
  try {
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
    throw error;
  }
}

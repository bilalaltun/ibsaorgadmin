import sharp from "sharp";

export async function compressImage(inputPath) {
  const buffer = await sharp(inputPath)
    .resize({ width: 1920 }) // max genişlik
    .webp({ quality: 75 }) // WebP sıkıştırması
    .toBuffer();

  return buffer;
}

import { cloudinary } from '../firebase/config';

/**
 * Upload an image File or Blob to Cloudinary using an unsigned upload preset.
 *
 * The preset must be created in Cloudinary dashboard with:
 *   - Signing mode: Unsigned
 *   - Folder: alankarana (or whatever)
 *   - Allowed formats: jpg, png, webp
 *   - Optional: incoming transformations (resize, quality)
 *
 *   const url = await uploadImage(file, { folder: 'products' });
 */
export const uploadImage = async (file, { folder = 'products', onProgress } = {}) => {
  if (!cloudinary.cloudName || !cloudinary.uploadPreset) {
    throw new Error('Cloudinary not configured — set VITE_CLOUDINARY_* in .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinary.uploadPreset);
  formData.append('folder', `alankarana/${folder}`);

  const url = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`;

  // Use XHR for progress; fetch doesn't expose upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
            format: res.format,
            bytes: res.bytes,
          });
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
};

/**
 * Build an optimized Cloudinary URL for a given public ID + transformations.
 * Most callers will store the secure_url returned by uploadImage; this is for
 * generating thumbnails or alternate sizes from a known publicId.
 *
 *   cldUrl(publicId, { width: 200, quality: 'auto' })
 */
export const cldUrl = (publicId, opts = {}) => {
  if (!publicId) return '';
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = opts;
  const parts = [`f_${format}`, `q_${quality}`];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  return `https://res.cloudinary.com/${cloudinary.cloudName}/image/upload/${parts.join(',')}/${publicId}`;
};

/**
 * Lightweight client-side image compression before upload.
 * Reduces 4MB phone photos to ~200KB JPEG @ 1600px wide — meaningful for old Android data plans.
 */
export const compressImage = (file, { maxWidth = 1600, quality = 0.85 } = {}) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return resolve(file);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            // Preserve original filename so Cloudinary keeps a sensible name
            const compressed = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

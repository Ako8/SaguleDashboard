import { FILE_UPLOAD } from './constants';

export interface FileValidationError {
  file: File;
  error: string;
}

export interface FileValidationResult {
  valid: File[];
  invalid: FileValidationError[];
}

/**
 * Validate files for upload
 */
export function validateFiles(files: File[]): FileValidationResult {
  const valid: File[] = [];
  const invalid: FileValidationError[] = [];

  files.forEach((file) => {
    // Check file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      invalid.push({
        file,
        error: `File size exceeds ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`,
      });
      return;
    }

    // Check file type
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      invalid.push({
        file,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
      });
      return;
    }

    valid.push(file);
  });

  return { valid, invalid };
}

/**
 * Read file as data URL for preview
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create FormData for multipart upload
 */
export function createFormData(file: File, additionalFields?: Record<string, string>): FormData {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return formData;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.'));
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Compress image before upload (basic canvas-based compression)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

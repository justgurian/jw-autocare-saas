import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

// Local storage directory for development
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
const ensureDirectories = () => {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'images'),
    path.join(UPLOAD_DIR, 'thumbnails'),
    path.join(UPLOAD_DIR, 'pdfs'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
};

ensureDirectories();

interface SaveImageResult {
  url: string;
  localPath: string;
  thumbnailUrl?: string;
}

export const storageService = {
  // Save image from buffer
  async saveImage(
    imageData: Buffer,
    tenantId: string,
    contentId: string,
    mimeType: string = 'image/png'
  ): Promise<SaveImageResult> {
    const extension = mimeType.split('/')[1] || 'png';
    const filename = `${contentId}.${extension}`;
    const tenantDir = path.join(UPLOAD_DIR, 'images', tenantId);

    // Ensure tenant directory exists
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const localPath = path.join(tenantDir, filename);
    fs.writeFileSync(localPath, imageData);

    // Generate URL (for local dev, serve from Express static)
    const url = `${config.apiUrl}/uploads/images/${tenantId}/${filename}`;

    logger.debug('Image saved', { localPath, url });

    return {
      url,
      localPath,
    };
  },

  // Save image from URL (download and save)
  async saveImageFromUrl(
    imageUrl: string,
    tenantId: string,
    contentId: string
  ): Promise<SaveImageResult> {
    try {
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get('content-type') || 'image/png';

      return this.saveImage(buffer, tenantId, contentId, mimeType);
    } catch (error) {
      logger.error('Failed to save image from URL', { error, imageUrl });
      throw error;
    }
  },

  // Get local path for uploaded file
  getLocalPath(relativePath: string): string {
    return path.join(UPLOAD_DIR, relativePath);
  },

  // Delete file
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.debug('File deleted', { path: fullPath });
    }
  },

  // Check if file exists
  fileExists(relativePath: string): boolean {
    return fs.existsSync(path.join(UPLOAD_DIR, relativePath));
  },

  // Upload buffer to storage and return URL
  async uploadBuffer(
    buffer: Buffer,
    storagePath: string,
    contentTypeOrOptions?: string | { contentType?: string }
  ): Promise<string> {
    try {
      // Handle both string and object contentType argument
      const contentType = typeof contentTypeOrOptions === 'string'
        ? contentTypeOrOptions
        : contentTypeOrOptions?.contentType;

      // Parse the storage path to get tenant and filename
      const fullPath = path.join(UPLOAD_DIR, storagePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the buffer to file
      fs.writeFileSync(fullPath, buffer);

      // Generate URL (for local dev, serve from Express static)
      const url = `${config.apiUrl}/uploads/${storagePath}`;

      logger.debug('Buffer uploaded', { storagePath, url, contentType });

      return url;
    } catch (error) {
      logger.error('Failed to upload buffer', { error, storagePath });
      throw error;
    }
  },

  // Upload base64 data to storage
  async uploadBase64(
    base64Data: string,
    storagePath: string,
    options?: { contentType?: string }
  ): Promise<string> {
    // Remove data URL prefix if present
    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    return this.uploadBuffer(buffer, storagePath, options);
  },
};

export default storageService;

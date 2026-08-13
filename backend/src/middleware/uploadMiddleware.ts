import multer, { StorageEngine, Multer } from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'contracts');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf'];
const ALLOWED_EXTENSIONS = ['.pdf'];

// Create uploads directory if it doesn't exist
export async function ensureUploadDirectory(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

// Custom storage engine for multer
const storage: StorageEngine = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    try {
      await ensureUploadDirectory();
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req: any, file: any, cb: any) => {
    // Generate safe filename: uuid + original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${randomUUID()}${ext}`;
    cb(null, filename);
  },
});

// File filter for multer
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error(`Invalid file type. Only PDF files are allowed.`));
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error(`Invalid file extension. Only .pdf files are allowed.`));
    return;
  }

  // Allow file
  cb(null, true);
};

// Create multer instance
export const uploadMiddleware: Multer = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Delete a file from disk
 */
export async function deleteUploadedFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Prevent path traversal attacks
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      throw new Error('Invalid file path');
    }

    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    // Don't throw - we still want to delete from DB even if file is missing
  }
}

/**
 * Get the full path for a stored file
 */
export function getUploadFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Get the URL path for serving the file
 */
export function getUploadFileUrl(filename: string): string {
  return `/uploads/contracts/${filename}`;
}

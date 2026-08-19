import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadStrategy {
  validate(file: File): void;
  save(file: File): Promise<string>;
}

export abstract class BaseUploadStrategy implements UploadStrategy {
  protected abstract maxSize: number; // in bytes
  protected abstract allowedMimeTypes: string[];
  protected abstract baseDir: string;

  public validate(file: File): void {
    if (file.size > this.maxSize) {
      throw new Error(`File size exceeds the limit of ${this.maxSize / (1024 * 1024)}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
  }

  public async save(file: File): Promise<string> {
    this.validate(file);

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Fallback to determine extension if not in original name
    let ext = path.extname(file.name);
    if (!ext) {
      if (file.type === 'image/jpeg') ext = '.jpg';
      else if (file.type === 'image/png') ext = '.png';
      else if (file.type === 'image/webp') ext = '.webp';
    }

    const filename = `${uuidv4()}${ext}`;
    
    // Ensure the directory exists
    const fullDir = path.join(process.cwd(), 'uploads', this.baseDir);
    await fs.mkdir(fullDir, { recursive: true });

    const fullPath = path.join(fullDir, filename);
    await fs.writeFile(fullPath, buffer);

    // Return the relative path to be used with the download endpoint
    return `${this.baseDir}/${filename}`;
  }
}

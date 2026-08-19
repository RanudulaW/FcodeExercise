import { BaseUploadStrategy } from './UploadStrategy';

export class PostUploadStrategy extends BaseUploadStrategy {
  protected maxSize = 5 * 1024 * 1024; // 5MB
  protected allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  protected baseDir = 'posts';
}

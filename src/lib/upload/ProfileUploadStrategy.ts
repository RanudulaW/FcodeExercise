import { BaseUploadStrategy } from './UploadStrategy';

export class ProfileUploadStrategy extends BaseUploadStrategy {
  protected maxSize = 2 * 1024 * 1024; // 2MB
  protected allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  protected baseDir = 'profiles';
}

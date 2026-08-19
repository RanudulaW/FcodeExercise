import { UploadStrategy } from './UploadStrategy';
import { ProfileUploadStrategy } from './ProfileUploadStrategy';
import { PostUploadStrategy } from './PostUploadStrategy';

export class UploadFactory {
  static getStrategy(type: string): UploadStrategy {
    switch (type) {
      case 'profile':
        return new ProfileUploadStrategy();
      case 'post':
        return new PostUploadStrategy();
      default:
        throw new Error(`Unsupported upload type: ${type}`);
    }
  }
}

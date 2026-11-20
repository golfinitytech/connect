import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const MAX_FACE_BYTES = 2_500_000;

/**
 * Stores user face photos in a private Supabase Storage bucket.
 * `User.facePhotoPath` holds the object key inside that bucket.
 */
@Injectable()
export class FaceStorageService {
  private readonly logger = new Logger(FaceStorageService.name);
  private readonly bucket = process.env.SUPABASE_FACE_BUCKET ?? 'face-photos';
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (this.client) return this.client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new InternalServerErrorException(
        'Supabase Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)',
      );
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return this.client;
  }

  /** Accepts a raw base64 string or a data URL (jpeg/png). Returns the stored object key. */
  async saveFace(
    userId: string,
    imageBase64: string,
    previousKey?: string | null,
  ): Promise<string> {
    const raw = imageBase64.trim();
    const match = raw.match(/^data:(image\/(jpeg|jpg|png));base64,(.+)$/i);
    const base64 = match ? match[3] : raw;
    const contentType = match ? match[1].toLowerCase().replace('jpg', 'jpeg') : 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';

    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) {
      throw new BadRequestException('Invalid image');
    }
    if (buffer.length > MAX_FACE_BYTES) {
      throw new BadRequestException('Image too large');
    }

    const key = `${userId}/${Date.now()}.${ext}`;
    const { error } = await this.getClient()
      .storage.from(this.bucket)
      .upload(key, buffer, { contentType, upsert: false });
    if (error) {
      this.logger.error(`Face upload failed: ${error.message}`);
      throw new InternalServerErrorException('Failed to store face photo');
    }

    if (previousKey && previousKey !== key) {
      await this.remove(previousKey);
    }
    return key;
  }

  async download(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    const { data, error } = await this.getClient()
      .storage.from(this.bucket)
      .download(key);
    if (error || !data) {
      throw new NotFoundException('Face photo not found');
    }
    return {
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || 'image/jpeg',
    };
  }

  private async remove(key: string) {
    const { error } = await this.getClient().storage.from(this.bucket).remove([key]);
    if (error) {
      this.logger.warn(`Could not remove old face photo ${key}: ${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envConfig } from 'src/config/env.config';

@Injectable()
export class CloudflareService {
  private readonly s3: S3Client;
  private readonly bucketName = envConfig.cloudflare_bucket_name;

  constructor() {
    this.s3 = new S3Client({
      endpoint: envConfig.cloudflare_r2_endpoint,
      credentials: {
        accessKeyId: envConfig.cloudflare_r2_access_key,
        secretAccessKey: envConfig.cloudflare_r2_secret_key,
      },
      region: 'auto',
    });
  }

  /**
   * Generate a pre-signed URL for uploading an image
   */
  async getUploadUrl(fileKey: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  /**
   * Generate a pre-signed URL for fetching an image
   */
  async getDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  /**
   * Generate a pre-signed URL for deleting an image
   */
  async getDeleteUrl(fileKey: string): Promise<string> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return await getSignedUrl(this.s3, command);
  }
}

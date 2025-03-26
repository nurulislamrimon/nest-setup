import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envConfig } from 'src/config/env.config';
import * as path from 'path';
import { lookup } from 'mime-types';

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
  async getUploadUrl(fileKey: string): Promise<{
    fileName: string;
    uploadUrl: string;
  }> {
    const fileExt = path.extname(fileKey);
    const fileName =
      fileKey.replace(fileExt, '').toLowerCase().split(' ').join('-') +
      Date.now() +
      fileExt;
    const contentType = lookup(fileExt) || 'application/octet-stream';

    // Generate the PutObjectCommand for the file
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      ContentType: contentType,
    });

    // Generate and return the pre-signed URL
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return {
      fileName,
      uploadUrl,
    };
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
  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3.send(command);
  }
}

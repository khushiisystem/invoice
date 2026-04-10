import { Injectable } from '@nestjs/common';
import { InjectS3 } from 'nestjs-s3';
import type { S3 } from 'nestjs-s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(
    @InjectS3() private readonly s3: S3,
    private configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const bucket = this.configService.get('AWS_S3_BUCKET') as string;
    const region = this.configService.get('AWS_REGION') as string;
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    const bucket = this.configService.get('AWS_S3_BUCKET') as string;
    const key = url.split('.amazonaws.com/')[1];
    if (!key) return;

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}

import { Module } from '@nestjs/common';
import { S3Module as NestS3Module } from 'nestjs-s3';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestS3Module.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        config: {
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID') as string,
            secretAccessKey: configService.get(
              'AWS_SECRET_ACCESS_KEY',
            ) as string,
          },
          region: configService.get('AWS_REGION') as string,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}

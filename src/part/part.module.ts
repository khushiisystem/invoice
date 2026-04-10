import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartController } from './part.controller';
import { PartService } from './part.service';
import { Part, PartSchema } from './schemas/part.schema';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Part.name, schema: PartSchema }]),
    S3Module,
  ],
  controllers: [PartController],
  providers: [PartService],
})
export class PartModule {}

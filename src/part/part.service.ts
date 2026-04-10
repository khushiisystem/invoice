import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Part, PartDocument } from './schemas/part.schema';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class PartService {
  constructor(
    @InjectModel(Part.name) private partModel: Model<PartDocument>,
    private s3Service: S3Service,
  ) {}

  async create(
    createPartDto: CreatePartDto,
    files: {
      topImage?: Express.Multer.File[];
      sideImage?: Express.Multer.File[];
      frontImage?: Express.Multer.File[];
      rearImage?: Express.Multer.File[];
      additionalImages?: Express.Multer.File[];
    },
  ): Promise<Part> {
    const partData = { ...createPartDto };

    // Upload fixed view images
    if (files.topImage)
      partData.topImage = await this.s3Service.uploadFile(
        files.topImage[0],
        'parts/top',
      );
    if (files.sideImage)
      partData.sideImage = await this.s3Service.uploadFile(
        files.sideImage[0],
        'parts/side',
      );
    if (files.frontImage)
      partData.frontImage = await this.s3Service.uploadFile(
        files.frontImage[0],
        'parts/front',
      );
    if (files.rearImage)
      partData.rearImage = await this.s3Service.uploadFile(
        files.rearImage[0],
        'parts/rear',
      );

    // Upload additional images
    if (files.additionalImages && files.additionalImages.length) {
      const uploadedUrls = await Promise.all(
        files.additionalImages.map((file) =>
          this.s3Service.uploadFile(file, 'parts/additional'),
        ),
      );
      partData.additionalImages = uploadedUrls;
    }

    const newPart = new this.partModel(partData);
    return newPart.save();
  }

  async findAll(query: any = {}): Promise<Part[]> {
    const filter: any = {};

    if (query.vehicleType) filter.vehicleType = query.vehicleType;
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    if (query.search) {
      filter.$or = [
        { partName: { $regex: query.search, $options: 'i' } },
        { itemCode: { $regex: query.search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      sortOption = { [field]: order === 'desc' ? -1 : 1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    return this.partModel.find(filter).sort(sortOption).exec();
  }

  async findOne(id: string): Promise<Part> {
    const part = await this.partModel.findById(id).exec();
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }

  async update(
    id: string,
    updatePartDto: UpdatePartDto,
    files: {
      topImage?: Express.Multer.File[];
      sideImage?: Express.Multer.File[];
      frontImage?: Express.Multer.File[];
      rearImage?: Express.Multer.File[];
      additionalImages?: Express.Multer.File[];
    },
  ): Promise<Part> {
    const existingPart = await this.findOne(id);
    const updatedData = { ...updatePartDto };

    // Helper to update image: delete old, upload new
    const updateImage = async (
      field: keyof Pick<
        Part,
        'topImage' | 'sideImage' | 'frontImage' | 'rearImage'
      >,
      fileArray?: Express.Multer.File[],
    ) => {
      if (fileArray && fileArray[0]) {
        if (existingPart[field])
          await this.s3Service.deleteFile(existingPart[field]);
        updatedData[field] = await this.s3Service.uploadFile(
          fileArray[0],
          `parts/${field}`,
        );
      }
    };

    await updateImage('topImage', files.topImage);
    await updateImage('sideImage', files.sideImage);
    await updateImage('frontImage', files.frontImage);
    await updateImage('rearImage', files.rearImage);

    // Additional images: replace all (simplest). For partial update you could implement more logic.
    if (files.additionalImages && files.additionalImages.length) {
      // Delete all old additional images
      for (const url of existingPart.additionalImages) {
        await this.s3Service.deleteFile(url);
      }
      const newUrls = await Promise.all(
        files.additionalImages.map((file) =>
          this.s3Service.uploadFile(file, 'parts/additional'),
        ),
      );
      updatedData.additionalImages = newUrls;
    }

    const updatedPart = await this.partModel
      .findByIdAndUpdate(id, updatedData, { new: true })
      .exec();

    if (!updatedPart) {
      throw new NotFoundException('Part not found');
    }
    return updatedPart;
  }

  async remove(id: string): Promise<void> {
    const part = await this.findOne(id);
    // Delete images from S3
    const imageFields = ['topImage', 'sideImage', 'frontImage', 'rearImage'];
    for (const field of imageFields) {
      const url = part[field];
      if (url) await this.s3Service.deleteFile(url);
    }
    for (const url of part.additionalImages) {
      await this.s3Service.deleteFile(url);
    }
    await this.partModel.findByIdAndDelete(id).exec();
  }
}

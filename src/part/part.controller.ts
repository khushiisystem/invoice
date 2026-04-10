import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Controller('parts')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'topImage', maxCount: 1 },
      { name: 'sideImage', maxCount: 1 },
      { name: 'frontImage', maxCount: 1 },
      { name: 'rearImage', maxCount: 1 },
      { name: 'additionalImages', maxCount: 20 },
    ]),
  )
  async create(
    @Body() createPartDto: CreatePartDto,
    @UploadedFiles()
    files: {
      topImage?: Express.Multer.File[];
      sideImage?: Express.Multer.File[];
      frontImage?: Express.Multer.File[];
      rearImage?: Express.Multer.File[];
      additionalImages?: Express.Multer.File[];
    },
  ) {
    return this.partService.create(createPartDto, files);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.partService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.partService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'topImage', maxCount: 1 },
      { name: 'sideImage', maxCount: 1 },
      { name: 'frontImage', maxCount: 1 },
      { name: 'rearImage', maxCount: 1 },
      { name: 'additionalImages', maxCount: 20 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePartDto: UpdatePartDto,
    @UploadedFiles()
    files: {
      topImage?: Express.Multer.File[];
      sideImage?: Express.Multer.File[];
      frontImage?: Express.Multer.File[];
      rearImage?: Express.Multer.File[];
      additionalImages?: Express.Multer.File[];
    },
  ) {
    return this.partService.update(id, updatePartDto, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.partService.remove(id);
  }
}

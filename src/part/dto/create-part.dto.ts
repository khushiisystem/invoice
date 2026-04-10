import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreatePartDto {
  @IsEnum(['2 wheeler', '4 wheeler'])
  vehicleType: string;

  @IsString()
  partName: string;

  @IsString()
  itemCode: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  color?: string;

  // image URLs will be set after upload
  topImage?: string;
  sideImage?: string;
  frontImage?: string;
  rearImage?: string;
  additionalImages?: string[];
}

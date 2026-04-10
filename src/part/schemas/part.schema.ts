import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartDocument = Part & Document;

@Schema({ timestamps: true })
export class Part {
  @Prop({ required: true, enum: ['2 wheeler', '4 wheeler'] })
  vehicleType: string;

  @Prop({ required: true })
  partName: string;

  @Prop({ required: true, unique: true })
  itemCode: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: Number, default: 0 })
  tax: number;

  @Prop()
  color: string;

  // 4 fixed view images
  @Prop()
  topImage: string;

  @Prop()
  sideImage: string;

  @Prop()
  frontImage: string;

  @Prop()
  rearImage: string;

  // unlimited additional images
  @Prop({ type: [String], default: [] })
  additionalImages: string[];
}

export const PartSchema = SchemaFactory.createForClass(Part);

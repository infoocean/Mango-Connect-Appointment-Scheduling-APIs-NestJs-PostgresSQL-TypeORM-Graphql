import { Field, Int, Float, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ServiceStatus } from '../../../graphql/models/serviceStatus';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ServiceType } from 'src/graphql/models/serviceType';

@InputType()
export class CreateServiceInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  duration: number;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  fee: number;

  @Field(() => GraphQLUpload, {
    description:
      'The image file to upload in filename, mimetype, encoding, createReadStream format.',
  })
  @IsNotEmpty()
  image: FileUpload;

  @Field({ nullable: true })
  @IsEnum(ServiceStatus, {
    message:
      'Invalid service status. Must be "active", "draft", "archive", or "delete".',
  })
  @IsOptional()
  status?: ServiceStatus;

  @Field({ nullable: true })
  @IsEnum(ServiceType, {
    message: 'Invalid type. Must be "online", "offline".',
  })
  @IsOptional()
  type?: ServiceType;

  @Field()
  @IsNotEmpty()
  @IsString()
  short_description: string;

  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  @IsObject()
  availability: Record<string, any>[];
}

@InputType()
export class UpdateServiceInput extends CreateServiceInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}

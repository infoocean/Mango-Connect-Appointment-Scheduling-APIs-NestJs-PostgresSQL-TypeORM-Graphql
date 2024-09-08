import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class CreateOptionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  option_key: string;

  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  @IsObject()
  option_value: Record<string, any>[];
}

@InputType()
export class logofaviconOptionVal {
  @Field()
  @IsNotEmpty()
  @IsString()
  org_title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  company_email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  company_phone: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  company_address: string;

  @Field(() => GraphQLUpload)
  @IsNotEmpty()
  org_logo: FileUpload;

  @Field(() => GraphQLUpload)
  @IsNotEmpty()
  org_favicon: FileUpload;
}

@InputType()
export class UpdateLogoFavIconOptionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  option_key: string;

  @Field(() => logofaviconOptionVal)
  @IsNotEmpty()
  @IsObject()
  option_value: logofaviconOptionVal;
}
@InputType()
export class authCredentials {
  @Field()
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  client_secret: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  redirect_uris: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  calender_id: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  api_key: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  cancel_uris: string;
  this: any;
}

@InputType()
export class authCode {
  @Field()
  @IsNotEmpty()
  @IsString()
  code: string;
}

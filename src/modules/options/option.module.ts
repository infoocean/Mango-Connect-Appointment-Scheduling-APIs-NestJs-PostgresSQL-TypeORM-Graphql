import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionResolver } from './option.resolver';
import { OptionService } from './option.services';
import { JwtService } from '@nestjs/jwt';
import { Option } from 'src/graphql/models/options';

@Module({
  imports: [TypeOrmModule.forFeature([Option])],
  providers: [OptionResolver, OptionService, JwtService],
  exports: [OptionService],
})
export class OptionModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityResolver } from './availability.resolver';
import { AvailabilityService } from './availability.services';
import { Availability } from 'src/graphql/models/availability';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Availability])],
  providers: [AvailabilityResolver, AvailabilityService, JwtService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}

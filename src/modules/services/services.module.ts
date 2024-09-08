import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from 'src/graphql/models/services';
import { ServiceResolver } from './services.resolver';
import { ServicesServices } from './services.service';
import { JwtService } from '@nestjs/jwt';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [TypeOrmModule.forFeature([Services]), AvailabilityModule],
  providers: [ServiceResolver, ServicesServices, JwtService],
  exports: [ServicesServices],
})
export class ServiceModule {}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CurrentUserData } from 'src/shared/current_user_dto';
import { Services } from 'src/graphql/models/services';
import {
  CreateServiceInput,
  UpdateServiceInput,
} from './servicesDto/createServiceInput';
import { AvailabilityService } from '../availability/availability.services';
import { saveFile } from 'src/shared/saveFile';
import { deleteFileAsync } from 'src/shared/removeFile';
@Injectable()
export class ServicesServices {
  constructor(
    @InjectRepository(Services)
    private serviceRepository: Repository<Services>,
    private availabilityService: AvailabilityService,
  ) {}

  //create a new service
  async createService(
    serviceData: CreateServiceInput,
    current_user: CurrentUserData,
  ) {
    try {
      const service = await this.serviceRepository.findOne({
        where: { name: serviceData?.name },
      });
      if (service) {
        return {
          success: false,
          message: 'Services allready created!',
          status: 400,
        };
      }
      //save file
      const { createReadStream, filename } = await serviceData.image;
      const imagePath = await saveFile(createReadStream, filename);

      //save service
      const newService = this.serviceRepository.create({
        ...serviceData,
        image: imagePath,
        owner_id: current_user?.id,
      });
      const result = await this.serviceRepository.save(newService);
      //save availability
      const data: any = serviceData?.availability;
      if (data?.availability) {
        const updatedData = this.updateServiceId(data?.availability, result.id);
        for (const item of updatedData) {
          await this.availabilityService.createAvailability(item, current_user);
        }
      }
      return {
        success: true,
        message: 'Services saved successfully',
        status: 201,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //update service
  async updateService(
    serviceData: UpdateServiceInput,
    current_user: CurrentUserData,
  ) {
    try {
      const { createReadStream, filename } = await serviceData.image;
      const imagePath = await saveFile(createReadStream, filename);
      //update service
      const serviceToUpdate: any = await this.findServiceById(serviceData?.id);
      //remove existing service image from folder
      await deleteFileAsync(serviceToUpdate?.image);
      Object.assign(serviceToUpdate, serviceData);
      const newService = this.serviceRepository.create({
        ...serviceData,
        image: imagePath,
        owner_id: current_user?.id,
      });
      const result = await this.serviceRepository.save(newService);
      //update  availability
      const data: any = serviceData?.availability;
      if (data?.availability) {
        const updatedData = this.updateServiceId(data?.availability, result.id);
        for (const item of updatedData) {
          await this.availabilityService.updateAvailabilityByServiceId(item);
        }
      }
      return {
        success: true,
        message: 'Services updated successfully',
        status: 202,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //get all services
  async getServices(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    filterBy?: string,
    filterValue?: string,
    current_user?: CurrentUserData,
  ) {
    let query = this.serviceRepository.createQueryBuilder('services');
    query = query.where(
      `${
        current_user?.role_id === 1
          ? 'services.is_deleted = :is_deleted'
          : 'services.status = :status AND services.is_deleted = :is_deleted'
      }`,
      {
        status: current_user?.role_id === 1 ? undefined : 'active',
        is_deleted: 0,
      },
    );
    if (search) {
      query.where(
        'services.name LIKE :search OR services.short_description LIKE :search',
        { search: `%${search}%` },
      );
    }
    if (sortBy && sortOrder) {
      query = query.orderBy(`services.${sortBy}`, sortOrder);
    }

    if (filterBy && filterValue) {
      query = query.andWhere(`services.${filterBy} = :filterValue`, {
        filterValue,
      });
    }

    const totalCount = await query.getCount();
    const totalPages = Math.ceil(totalCount / limit);
    const services = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    const data = {
      totalCount,
      totalPages,
      currentPage: page,
      services,
    };
    return JSON.stringify(data);
  }

  // find service by service id
  async findServiceById(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      return new Error('Service not found associated with this user');
    }
    return service;
  }

  //get service details with availability
  async getServiceDetailsById(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    const availability =
      await this.availabilityService.getAvailabilityByServiceId(service?.id);
    const result = availability.map(({ key, value }) => ({ key, value }));
    const data = {
      service: service,
      availability: result,
    };
    return JSON.stringify(data);
  }

  //delete services
  async deleteService(ids: number[]) {
    const serviceToDelete = await this.serviceRepository.find({
      where: {
        id: In(ids),
      },
    });
    serviceToDelete.forEach((service) => {
      service.is_deleted = 1;
    });
    await this.serviceRepository.save(serviceToDelete);
    return {
      success: true,
      message: 'service deleted successfully',
      status: 200,
    };
  }

  //update service status
  async updateServiceStatus(id: number, status: string) {
    const result = await this.serviceRepository
      .createQueryBuilder()
      .update(Services)
      .set({ status })
      .where('id = :id', { id })
      .execute();
    if (result.affected === 0) {
      throw new Error('Service not found');
    }
    return {
      success: true,
      message: 'Service status updated successfully',
      status: 202,
    };
  }

  //add aervice id(last insert id) to availability array after service inserted
  updateServiceId(data: any[], resultId: number) {
    return data.map((item: any) => ({
      ...item,
      service_id: resultId,
    }));
  }
}

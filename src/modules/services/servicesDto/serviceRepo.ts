import { Services } from 'src/graphql/models/services';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Services)
export class ServiceRepo extends Repository<Services> {
  async findServices(
    page: number,
    limit: number,
    search: string,
    sortField: string,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<{ data: Services[]; count: number }> {
    const query = this.createQueryBuilder('service');

    if (search) {
      query.where(
        'service.name LIKE :search OR service.short_description LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortField && sortOrder) {
      query.orderBy(`service.${sortField}`, sortOrder);
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, count] = await query.getManyAndCount();

    return { data, count };
  }
}

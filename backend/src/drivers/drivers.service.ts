import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  // Контролерът очаква findAll()
  async findAll() {
    return this.prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Body is required');
    }

    const name = data.name ? String(data.name).trim() : '';
    if (!name) throw new BadRequestException('name is required');

    const phone = data.phone ? String(data.phone).trim() : null;

    // Не добавяме isActive, защото в твоя Prisma schema Driver няма такова поле
    return this.prisma.driver.create({
      data: {
        name,
        ...(phone ? { phone } : {}),
      },
    });
  }
}

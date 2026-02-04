import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: { name: string; phone?: string; isActive?: boolean }) {
    return this.prisma.driver.create({
      data: {
        name: data.name,
        phone: data.phone,
        isActive: data.isActive ?? true,
      },
    });
  }
}

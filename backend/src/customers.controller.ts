import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/customers')
export class CustomersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@Query('q') q?: string) {
    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : undefined;

    return this.prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      vat?: string;
      address?: string;
      email?: string;
      phone?: string;
    },
  ) {
    if (!body?.name?.trim()) {
      throw new Error('name is required');
    }
    return this.prisma.customer.create({
      data: {
        name: body.name.trim(),
        vat: body.vat,
        address: body.address,
        email: body.email,
        phone: body.phone,
      },
    });
  }
}

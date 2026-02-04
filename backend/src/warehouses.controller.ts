import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/warehouses')
export class WarehousesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.warehouse.findMany();
  }

  @Post()
  async create(
    @Body()
    body: {
      code: string;
      name: string;
      country: string;
      address?: string;
    },
  ) {
    const allowed = ['BG', 'NL', 'MAIN', 'MAIN2'] as const;
    type WarehouseCode = (typeof allowed)[number];

    if (!body || !body.code || !body.name || !body.country) {
      throw new BadRequestException('Missing required fields');
    }

    if (!allowed.includes(body.code as WarehouseCode)) {
      throw new BadRequestException(`Invalid code. Allowed: ${allowed.join(', ')}`);
    }

    try {
      return await this.prisma.warehouse.create({
        data: {
          code: body.code as any,
          name: body.name,
          country: body.country,
          address: body.address,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Warehouse code already exists');
      }
      throw e;
    }
  }
}

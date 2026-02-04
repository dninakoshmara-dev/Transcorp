import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Prisma, WarehouseCode } from '@prisma/client';

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
    const allowed = Object.values(WarehouseCode);

    // ❌ невалиден код → 400
    if (!allowed.includes(body.code as WarehouseCode)) {
      throw new BadRequestException(
        `Invalid WarehouseCode. Allowed: ${allowed.join(', ')}`,
      );
    }

    try {
      // ✅ създаване
      return await this.prisma.warehouse.create({
        data: {
          code: body.code as WarehouseCode,
          name: body.name,
          country: body.country,
          address: body.address,
        },
      });
    } catch (e) {
      // ❌ уникален code → 409 вместо 500
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Warehouse code already exists');
      }

      throw e;
    }
  }
}

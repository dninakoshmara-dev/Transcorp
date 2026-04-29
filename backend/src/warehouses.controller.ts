import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

function mustString(name: string, v: unknown): string {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new BadRequestException(`${name} is required and must be a non-empty string`);
  }
  return v.trim();
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.warehouse.findMany();
  }

  @Roles('ADMIN')
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
          name: mustString('name', body.name),
          country: mustString('country', body.country),
          address: mustString('address', body.address),
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

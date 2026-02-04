import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/shipments')
export class ShipmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.shipment.findMany();
  }

  @Post()
  create(
    @Body()
    body: {
      refNo: string;
      description?: string;
      palletsTotal: number;
      weightKg?: number;
      notes?: string;
      customerId: string;
      warehouseId: string;
    },
  ) {
    console.log('SHIPMENTS POST BODY:', body);

    return this.prisma.shipment.create({
      data: {
        refNo: body.refNo,
        description: body.description ?? null,
        palletsTotal: Number(body.palletsTotal),
        weightKg: body.weightKg ?? null,
        notes: body.notes ?? null,
        customerId: body.customerId,
        warehouseId: body.warehouseId,
      },
    });
  }
}

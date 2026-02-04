import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/trip-shipments')
export class TripShipmentsController {
  constructor(private prisma: PrismaService) {}

  // ✅ STEP 2: LIST endpoint
  @Get()
  async list() {
    return this.prisma.tripShipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        trip: true,
        shipment: true,
      },
    });
  }

  // ✅ Allocate pallets to a trip
  @Post()
  async allocate(
    @Body()
    body: {
      tripId: string;
      shipmentId: string;
      palletsAllocated: number;
    },
  ) {
    if (!body.tripId) throw new BadRequestException('tripId required');
    if (!body.shipmentId) throw new BadRequestException('shipmentId required');
    if (!Number.isInteger(body.palletsAllocated) || body.palletsAllocated <= 0) {
      throw new BadRequestException('palletsAllocated must be positive integer');
    }

    const shipment = await this.prisma.shipment.findUnique({ where: { id: body.shipmentId } });
    if (!shipment) throw new BadRequestException('Shipment not found');

    const agg = await this.prisma.tripShipment.aggregate({
      where: { shipmentId: body.shipmentId },
      _sum: { palletsAllocated: true },
    });

    const currentlyAllocated = agg._sum.palletsAllocated ?? 0;
    const availableNow = shipment.palletsTotal - currentlyAllocated;

    if (body.palletsAllocated > availableNow) {
      throw new BadRequestException(`Not enough available pallets. Available=${availableNow}`);
    }

    const existing = await this.prisma.tripShipment.findFirst({
      where: { tripId: body.tripId, shipmentId: body.shipmentId },
    });

    if (existing) {
      return this.prisma.tripShipment.update({
        where: { id: existing.id },
        data: { palletsAllocated: existing.palletsAllocated + body.palletsAllocated },
      });
    }

    return this.prisma.tripShipment.create({
      data: {
        tripId: body.tripId,
        shipmentId: body.shipmentId,
        palletsAllocated: body.palletsAllocated,
      },
    });
  }

  @Post('load')
  async load(
    @Body()
    body: {
      tripShipmentId: string;
      palletsLoaded: number;
    },
  ) {
    if (!body.tripShipmentId) throw new BadRequestException('tripShipmentId required');
    if (!Number.isInteger(body.palletsLoaded) || body.palletsLoaded <= 0) {
      throw new BadRequestException('palletsLoaded must be positive integer');
    }

    const ts = await this.prisma.tripShipment.findUnique({
      where: { id: body.tripShipmentId },
      include: { trip: true },
    });
    if (!ts) throw new BadRequestException('TripShipment not found');

    // ✅ business rule (you already hit this)
    if (ts.trip?.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can load only when trip is IN_PROGRESS');
    }

    const newLoaded = ts.palletsLoaded + body.palletsLoaded;
    if (newLoaded > ts.palletsAllocated) {
      throw new BadRequestException('Cannot load more than allocated pallets');
    }

    return this.prisma.tripShipment.update({
      where: { id: ts.id },
      data: { palletsLoaded: newLoaded },
    });
  }

  @Post('deliver')
  async deliver(
    @Body()
    body: {
      tripShipmentId: string;
      palletsDelivered: number;
    },
  ) {
    if (!body.tripShipmentId) throw new BadRequestException('tripShipmentId required');
    if (!Number.isInteger(body.palletsDelivered) || body.palletsDelivered <= 0) {
      throw new BadRequestException('palletsDelivered must be positive integer');
    }

    const ts = await this.prisma.tripShipment.findUnique({
      where: { id: body.tripShipmentId },
      include: { trip: true },
    });
    if (!ts) throw new BadRequestException('TripShipment not found');

    if (ts.trip?.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can deliver only when trip is IN_PROGRESS');
    }

    const newDelivered = ts.palletsDelivered + body.palletsDelivered;
    if (newDelivered > ts.palletsLoaded) {
      throw new BadRequestException('Cannot deliver more than loaded pallets');
    }

    return this.prisma.tripShipment.update({
      where: { id: ts.id },
      data: { palletsDelivered: newDelivered },
    });
  }
}

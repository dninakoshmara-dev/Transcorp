import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

type TripStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
const ALLOWED: TripStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

@Controller('api/trips')
export class TripsController {
  constructor(private prisma: PrismaService) {}

  // =========================
  // LIST TRIPS
  // GET /api/trips
  // =========================
  @Get()
  async list() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================
  // CREATE TRIP
  // POST /api/trips
  // =========================
  @Post()
  async create(
    @Body()
    body: {
      truckId: string;
      startWarehouseId: string;
      driverId?: string;
    },
  ) {
    if (!body?.truckId) throw new BadRequestException('truckId is required');
    if (!body?.startWarehouseId)
      throw new BadRequestException('startWarehouseId is required');

    const truck = await this.prisma.truck.findUnique({
      where: { id: body.truckId },
    });
    if (!truck) throw new BadRequestException('Truck not found');

    if (body.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: body.driverId },
      });
      if (!driver) throw new BadRequestException('Driver not found');
    }

    return this.prisma.trip.create({
      data: {
        truckId: body.truckId,
        startWarehouseId: body.startWarehouseId,
        status: 'PLANNED',
        ...(body.driverId ? { driverId: body.driverId } : {}),
      },
    });
  }

  // =========================
  // CHANGE STATUS
  // POST /api/trips/status
  // =========================
  @Post('status')
  async setStatus(@Body() body: any) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Body is required');
    }

    const tripId = body.tripId as string | undefined;
    const status = body.status as TripStatus | undefined;
    const driverId = body.driverId as string | undefined;

    if (!tripId) throw new BadRequestException('tripId is required');
    if (!status) throw new BadRequestException('status is required');
    if (!ALLOWED.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Allowed: ${ALLOWED.join(', ')}`,
      );
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });
    if (!trip) throw new BadRequestException('Trip not found');

    // =========================
    // IMMUTABLE STATES
    // =========================
    if (trip.status === 'COMPLETED' && status !== 'COMPLETED') {
      throw new BadRequestException(
        'Cannot change status of a COMPLETED trip',
      );
    }

    if (trip.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new BadRequestException(
        'Cannot change status of a CANCELLED trip',
      );
    }

    // =========================
    // BLOCK COMPLETED IF NOT FULLY DELIVERED
    // =========================
    if (status === 'COMPLETED') {
      const tripWithShipments = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          shipments: {
            select: {
              shipmentId: true,
              palletsAllocated: true,
              palletsDelivered: true,
            },
          },
        },
      });

      if (!tripWithShipments) {
        throw new BadRequestException('Trip not found');
      }

      const notDelivered = tripWithShipments.shipments.filter(
        (ts) =>
          (ts.palletsDelivered ?? 0) < (ts.palletsAllocated ?? 0),
      );

      if (notDelivered.length > 0) {
        const details = notDelivered
          .slice(0, 5)
          .map(
            (x) =>
              `${x.shipmentId}:${x.palletsDelivered}/${x.palletsAllocated}`,
          )
          .join(', ');

        throw new BadRequestException(
          `Cannot complete trip: undelivered pallets exist (${details})`,
        );
      }
    }

    // =========================
    // BUILD UPDATE DATA
    // =========================
    const data: any = { status };

    if (driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
      });
      if (!driver) throw new BadRequestException('Driver not found');
      data.driverId = driverId;
    }

    if (status === 'IN_PROGRESS' && !trip.startedAt) {
      data.startedAt = new Date();
    }

    if (status === 'COMPLETED' && !trip.completedAt) {
      data.completedAt = new Date();
    }

    return this.prisma.trip.update({
      where: { id: tripId },
      data,
    });
  }
}

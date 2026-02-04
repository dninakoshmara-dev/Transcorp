import { Controller, Get } from '@nestjs/common';

@Controller('api/dashboard')
export class DashboardController {
  // ✅ Нов endpoint: GET /api/dashboard
  @Get()
  getDashboard() {
    // Тук може да върнеш каквото ти трябва за "главното" табло
    return {
      ok: true,
      message: 'Dashboard root endpoint is working',
      endpoints: ['/api/dashboard/progress', '/api/dashboard/progress/trips'],
    };
  }

  // ✅ Съществуващ endpoint (по лога): GET /api/dashboard/progress
  @Get('progress')
  getProgress() {
    // Примерни данни (замени с реални от Prisma/Service)
    return {
      status: 'ok',
      progress: {
        shipmentsTotal: 0,
        shipmentsDone: 0,
        tripsTotal: 0,
        tripsInProgress: 0,
      },
    };
  }

  // ✅ Съществуващ endpoint (по лога): GET /api/dashboard/progress/trips
  @Get('progress/trips')
  getProgressTrips() {
    // Примерни данни (замени с реални от Prisma/Service)
    return {
      status: 'ok',
      trips: [],
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = {
  sub: string; // user.id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    // Fail-fast още при startup
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    const rows = (await this.prisma.$queryRaw`
      SELECT "id", "email", "role", "isActive"
      FROM public."User"
      WHERE "id" = ${payload.sub}
      LIMIT 1
    `) as Array<{ id: string; email: string; role: string | null; isActive: boolean }>;

    const user = rows[0];

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user; // req.user
  }
}
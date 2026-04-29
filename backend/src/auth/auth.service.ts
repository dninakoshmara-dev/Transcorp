import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const rows = (await this.prisma.$queryRaw`
      SELECT "id", "email", "role", "isActive", "passwordHash"
      FROM public."User"
      WHERE "email" = ${email}
      LIMIT 1
    `) as Array<{
      id: string;
      email: string;
      role: string | null;
      isActive: boolean;
      passwordHash: string | null;
    }>;

    const user = rows[0];

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: Record<string, any> = { sub: user.id, email: user.email };
    if (user.role) payload.role = user.role;

    return { access_token: await this.jwt.signAsync(payload) };
  }
}
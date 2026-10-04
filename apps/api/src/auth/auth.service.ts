import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async uniqueUsername(displayName: string) {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 18) || 'mentis';
    for (let i = 0; i < 10; i++) {
      const candidate = `${base}_${Math.floor(100 + Math.random() * 900)}`;
      if (!(await this.prisma.user.findUnique({ where: { username: candidate } }))) return candidate;
    }
    return `mentis_${Date.now().toString().slice(-7)}`;
  }

  private publicUser(user: { id: string; email: string; displayName: string; username: string; createdAt: Date }) {
    return { ...user, createdAt: user.createdAt.toISOString() };
  }

  private async issueTokens(user: { id: string; email: string }) {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: accessSecret, expiresIn: this.config.get('JWT_ACCESS_TTL') || '15m' },
    );
    const tokenRecord = await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: 'pending', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, jti: tokenRecord.id },
      { secret: refreshSecret, expiresIn: this.config.get('JWT_REFRESH_TTL') || '30d' },
    );
    await this.prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { tokenHash: await bcrypt.hash(refreshToken, 12) } });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) throw new BadRequestException('Email is already registered');
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: dto.displayName.trim(),
        username: await this.uniqueUsername(dto.displayName),
        passwordHash: await bcrypt.hash(dto.password, 12),
      },
      select: { id: true, email: true, displayName: true, username: true, createdAt: true },
    });
    return { user: this.publicUser(user), ...(await this.issueTokens(user)) };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    return { user: this.publicUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; jti: string }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
      if (!record || record.expiresAt < new Date() || !(await bcrypt.compare(refreshToken, record.tokenHash))) throw new Error('invalid');
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      return this.issueTokens({ id: payload.sub, email: payload.email });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwt.decode(refreshToken) as { jti?: string } | null;
      if (payload?.jti) await this.prisma.refreshToken.deleteMany({ where: { id: payload.jti } });
    } catch {}
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, username: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }
}

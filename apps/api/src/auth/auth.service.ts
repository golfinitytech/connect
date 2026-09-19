import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../mail/email.service';
import { FirebaseService } from '../firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const existingMember = await this.usersService.findByMemberId(
      registerDto.memberId,
    );
    if (existingMember) {
      throw new ConflictException('Member ID already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      verificationToken,
      lastLoginAt: new Date(),
    });

    // Send Verification Email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.fullName,
      verificationToken,
    );

    const { password, verificationToken: _, ...result } = user;
    return {
      user: result,
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async googleLogin(idToken: string) {
    try {
      if (!idToken) {
        throw new BadRequestException('Google ID token is required');
      }

      // Verify Google ID Token
      let payload;
      try {
        // Try Firebase verification first if it looks like a Firebase token
        payload = await this.firebaseService.verifyIdToken(idToken);
      } catch (error) {
        // Fallback to direct Google verification for mobile/native tokens
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
        });
        payload = ticket.getPayload();
      }

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        throw new BadRequestException('Email not provided by Google');
      }

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Create new user if not exists
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: name || 'Google User',
            password: '', // No password for Google users
            memberId: `G-${googleId.substring(0, 8)}`,
            avatarUrl: picture || null,
            emailVerified: new Date(), // Google emails are already verified
            handicapIndex: 0.0, // Default handicap
          },
        });

        // Send welcome email for new Google users
        await this.emailService.sendWelcomeEmail(user.email, user.fullName);
      } else if (!user.avatarUrl && picture) {
        // Update avatar if missing
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: picture },
        });
      }

      const { password, verificationToken: _, ...result } = user;

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        user: result,
        access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.fullName);

    return { message: 'Email successfully verified' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { password, verificationToken, ...result } = user;
    return {
      user: result,
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // For security, don't reveal if user exists or not
    if (!user) {
      return {
        message: 'If your email is registered, you will receive a reset link.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await this.prisma.passwordReset.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    // Send Reset Email via MailerSend
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      token,
    );

    // In a real app, send email here. For now, we return the token for testing/demo.
    return {
      message: 'If your email is registered, you will receive a reset link.',
      token: process.env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token: resetPasswordDto.token },
    });

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByEmail(reset.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);

    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    return { message: 'Password successfully reset' };
  }

  async enrollFace(userId: string, imageBase64: string) {
    const raw = imageBase64.trim();
    const match = raw.match(/^data:(image\/(jpeg|jpg|png));base64,(.+)$/i);
    const base64 = match ? match[3] : raw;
    const mime = match ? match[1].toLowerCase() : 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : 'jpg';

    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) {
      throw new BadRequestException('Invalid image');
    }
    if (buffer.length > 2_500_000) {
      throw new BadRequestException('Image too large');
    }

    const uploadRoot =
      process.env.FACE_UPLOAD_DIR ??
      path.join(process.cwd(), 'apps', 'api', 'uploads', 'faces');
    await fs.mkdir(uploadRoot, { recursive: true });

    const fileName = `${userId}-${Date.now()}.${ext}`;
    const fullPath = path.join(uploadRoot, fileName);
    await fs.writeFile(fullPath, buffer);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        facePhotoPath: fullPath,
        facePhotoUpdatedAt: new Date(),
      },
    });

    return { ok: true };
  }
}

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { User, UserDocument } from '../src/users/schemas/user.schema';
import { UserRole } from '../src/common/enums';

async function seedAdmin(): Promise<void> {
  let app: INestApplicationContext | undefined;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    const configService = app.get(ConfigService);
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    const mongoUri = configService.get<string>('MONGODB_URI');
    const adminName = configService.get<string>('ADMIN_NAME');
    const adminEmail = configService.get<string>('ADMIN_EMAIL');
    const adminPassword = configService.get<string>('ADMIN_PASSWORD');

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in the environment.');
    }

    if (!adminName || !adminName.trim()) {
      throw new Error('ADMIN_NAME is required and cannot be empty.');
    }

    if (!adminEmail || !adminEmail.trim()) {
      throw new Error('ADMIN_EMAIL is required and cannot be empty.');
    }

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is required and cannot be empty.');
    }

    const normalizedEmail = adminEmail.trim().toLowerCase();

    // Check if an account with this email already exists
    const existingUser = await userModel
      .findOne({ email: normalizedEmail })
      .exec();

    if (existingUser) {
      console.log(
        `[Seed] Admin user with email "${normalizedEmail}" already exists. No changes were made.`,
      );
      return;
    }

    // Hash password using bcrypt before storing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const newAdmin = new userModel({
      name: adminName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: UserRole.ADMIN,
    });

    await newAdmin.save();

    console.log(
      `[Seed] Admin account successfully created for "${normalizedEmail}".`,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Seed Error] Seeding failed: ${message}`);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.close();
    }
  }
}

void seedAdmin();

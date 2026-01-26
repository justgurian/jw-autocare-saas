import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { prisma } from '../../db/client';
import { config, USER_ROLES } from '../../config';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  businessName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
  };
}

// Generate slug from business name
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + nanoid(6);
}

// Generate JWT tokens
function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(
    { sub: payload.sub, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  // Parse expiration
  const expiresInMs = parseExpiresIn(config.jwt.expiresIn);

  return {
    accessToken,
    refreshToken,
    expiresIn: expiresInMs,
  };
}

// Parse expiration string to milliseconds
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export const authService = {
  // Register new user and tenant
  async register(input: RegisterInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const { email, password, firstName, lastName, businessName } = input;

    logger.info('Registration attempt', { email, businessName });

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      logger.warn('Registration failed: email already exists', { email });
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create tenant and user in transaction
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        logger.info('Creating tenant', { businessName });
        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: businessName,
            slug: generateSlug(businessName),
            subscriptionTier: 'base',
            subscriptionStatus: 'trialing',
            onboardingStep: 1,
            settings: {
              onboardingCompleted: false,
            },
          },
        });
        logger.info('Tenant created', { tenantId: tenant.id });

        // Create user as owner
        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            role: USER_ROLES.OWNER,
            emailVerified: false,
          },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                subscriptionTier: true,
                onboardingCompleted: true,
              },
            },
          },
        });
        logger.info('User created', { userId: user.id });

        // Create brand kit placeholder
        await tx.brandKit.create({
          data: {
            tenantId: tenant.id,
            businessName,
          },
        });
        logger.info('Brand kit created');

        return user;
      });
    } catch (txError) {
      logger.error('Transaction failed during registration', { error: txError, email });
      throw txError;
    }

    // Generate tokens
    logger.info('Generating tokens');
    const tokens = generateTokens({
      sub: result.id,
      tenantId: result.tenantId,
      email: result.email,
      role: result.role,
    });
    logger.info('Tokens generated', { tokenLength: tokens.refreshToken.length });

    // Store refresh token
    try {
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: result.id,
          expiresAt: new Date(Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn)),
        },
      });
      logger.info('Refresh token stored');
    } catch (tokenError) {
      logger.error('Failed to store refresh token', { error: tokenError, tokenLength: tokens.refreshToken.length });
      throw tokenError;
    }

    logger.info('New user registered', { userId: result.id, tenantId: result.tenantId });

    return {
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
        tenantId: result.tenantId,
        tenant: result.tenant,
      },
      tokens,
    };
  },

  // Login user
  async login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionTier: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn)),
      },
    });

    logger.info('User logged in', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
      tokens,
    };
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    let payload: { sub: string; type: string };
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { sub: string; type: string };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Check if token exists and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn)),
      },
    });

    return tokens;
  },

  // Logout user
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    logger.info('User logged out', { userId });
  },

  // Get current user
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionTier: true,
            onboardingCompleted: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
    };
  },

  // Request password reset
  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      logger.info('Password reset requested for non-existent email', { email });
      return;
    }

    // Generate a reset token
    const resetToken = nanoid(32);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // TODO: Send email with reset link
    // For now, just log the token (in production, this would send an email)
    logger.info('Password reset token generated', {
      userId: user.id,
      email,
      // In production, never log the actual token - this is just for development
      resetLink: `${config.webUrl}/auth/reset-password?token=${resetToken}`,
    });
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // Revoke all existing refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info('Password reset successful', { userId: user.id });
  },

  // Google OAuth callback
  async googleAuthCallback(user: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
  }): Promise<AuthTokens> {
    const tokens = generateTokens({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiresIn(config.jwt.refreshExpiresIn)),
      },
    });

    return tokens;
  },
};

export default authService;

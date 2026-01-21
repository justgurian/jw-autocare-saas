import { PassportStatic } from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../../db/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';

interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function configurePassport(passport: PassportStatic): void {
  // JWT Strategy
  const jwtOptions: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            tenant: {
              select: {
                subscriptionTier: true,
              },
            },
          },
        });

        if (!user) {
          return done(null, false);
        }

        // Return user with tier information
        return done(null, {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          role: user.role,
          tier: user.tenant.subscriptionTier as 'base' | 'premium',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        });
      } catch (error) {
        logger.error('JWT Strategy error:', error);
        return done(error, false);
      }
    })
  );

  // Google OAuth Strategy (only if credentials are configured)
  if (config.google.clientId && config.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.google.clientId,
          clientSecret: config.google.clientSecret,
          callbackURL: config.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;

            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            // Try to find existing user by Google ID
            let user = await prisma.user.findFirst({
              where: { googleId: profile.id },
              include: {
                tenant: {
                  select: {
                    subscriptionTier: true,
                  },
                },
              },
            });

            if (!user) {
              // Try to find by email
              user = await prisma.user.findFirst({
                where: { email },
                include: {
                  tenant: {
                    select: {
                      subscriptionTier: true,
                    },
                  },
                },
              });

              if (user) {
                // Link Google account to existing user
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    googleId: profile.id,
                    emailVerified: true,
                  },
                });
              }
            }

            if (!user) {
              // User doesn't exist - they need to register first
              return done(null, false, { message: 'No account found. Please register first.' });
            }

            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });

            return done(null, {
              id: user.id,
              tenantId: user.tenantId,
              email: user.email,
              role: user.role,
              tier: user.tenant.subscriptionTier as 'base' | 'premium',
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
            });
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error, undefined);
          }
        }
      )
    );
  }
}

export default configurePassport;

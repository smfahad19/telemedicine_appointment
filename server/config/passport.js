import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from './db.js';

// ---------- GOOGLE ----------
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          role: 'PATIENT',
          profileImage: profile.photos?.[0]?.value
        }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id }
      });
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// ---------- GITHUB ----------
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { githubId: profile.id } });

    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          role: 'PATIENT',
          profileImage: profile.photos?.[0]?.value
        }
      });
    } else if (!user.githubId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { githubId: profile.id }
      });
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

export default passport;
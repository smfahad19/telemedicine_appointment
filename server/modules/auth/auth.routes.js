import express from 'express';
import passport from '../../config/passport.js';
import { register, login, oauthCallback } from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallback);

// GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), oauthCallback);

export default router;
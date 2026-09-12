import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ProgressionService } from '../services/progressionService.js';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username.trim(), email.trim().toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'User with this username or email already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Insert user
    await db.query(
      `INSERT INTO users (id, username, email, password_hash, level, xp, gold, current_streak, best_streak, title)
       VALUES ($1, $2, $3, $4, 1, 0, 100, 0, 0, 'Novice Cyberpunk')`,
      [userId, username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    // Initialize 6 Core Character Attributes
    const defaultAttributes = [
      { name: 'Intelligence', value: 10 },
      { name: 'Knowledge', value: 10 },
      { name: 'Strength', value: 10 },
      { name: 'Stamina', value: 10 },
      { name: 'Discipline', value: 10 },
      { name: 'Social', value: 10 }
    ];

    for (const attr of defaultAttributes) {
      const attrId = `attr-${userId}-${attr.name}`;
      await db.query(
        'INSERT INTO user_attributes (id, user_id, attribute_name, value) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [attrId, userId, attr.name, attr.value]
      );
    }

    // Create JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'cyberpunk_life_rpg_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: userId, username: username.trim(), email: email.trim().toLowerCase() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user info
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        level: 1,
        xp: 0,
        xpRequiredNext: ProgressionService.getXpRequiredForLevel(1),
        gold: 100,
        currentStreak: 0,
        bestStreak: 0,
        title: 'Novice Cyberpunk'
      }
    });
  } catch (err: any) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: 'Username/Email and password are required.' });
      return;
    }

    const searchTerm = usernameOrEmail.trim().toLowerCase();

    // Query user
    const userRes = await db.query(
      'SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $1',
      [searchTerm]
    );

    if (userRes.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const user = userRes.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    // Create JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'cyberpunk_life_rpg_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const xpRequiredNext = ProgressionService.getXpRequiredForLevel(user.level);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        xpRequiredNext,
        gold: user.gold,
        currentStreak: user.current_streak,
        bestStreak: user.best_streak,
        title: user.title,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userRes.rows[0];
    const xpRequiredNext = ProgressionService.getXpRequiredForLevel(user.level);

    // Fetch user attributes
    const attrRes = await db.query('SELECT attribute_name, value FROM user_attributes WHERE user_id = $1', [userId]);
    const attributes: Record<string, number> = {};
    for (const row of attrRes.rows) {
      attributes[row.attribute_name] = row.value;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        xpRequiredNext,
        gold: user.gold,
        currentStreak: user.current_streak,
        bestStreak: user.best_streak,
        lastActivityDate: user.last_activity_date,
        title: user.title,
        avatarUrl: user.avatar_url,
        attributes
      }
    });
  } catch (err: any) {
    console.error('[Auth] GetMe error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Authentication required. Use an Authorization: Bearer <token> header.' });
    return;
  }

  let secret: string;
  try {
    secret = getJwtSecret();
  } catch (error: any) {
    res.status(503).json({ error: error.message });
    return;
  }

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = user;
    next();
  });
};

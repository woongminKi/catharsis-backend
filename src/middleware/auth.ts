import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'catharsis-admin-secret-key';

    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      username: string;
      role: string;
    };

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
};

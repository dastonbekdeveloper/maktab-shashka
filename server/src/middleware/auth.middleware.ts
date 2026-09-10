import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Avtorizatsiyadan o‘tilmagan (token topilmadi).' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token yaroqsiz yoki muddati tugagan.' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Ushbu amalni bajarish uchun sizda yetarli ruxsat yo‘q.' });
    }
    next();
  };
};

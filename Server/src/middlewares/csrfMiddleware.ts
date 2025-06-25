import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';

const excludedRoutes = ['/login', '/register', '/google-auth', '/csrf-token'];

  const isProd = process.env.PROD === 'true';
  
  const sameSite = isProd ? 'none' : 'lax';
  const secure = isProd; 

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite,
    secure,
  },
});

const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (
    !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ||
    excludedRoutes.some(route => req.path.includes(route))
  ) {
    return next();
  }

  csrfProtection(req, res, (err) => {
    if (err) {
      if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
          code: 'CSRF_INVALID',
          message: 'Invalid or missing CSRF token.'
        });
      }

      return next(err);
    }

    next();
  });
};

export default csrfMiddleware;
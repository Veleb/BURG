import { Request, Response, NextFunction } from 'express';
import tokenUtils from '../utils/tokenUtil';

const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {

  const authRoutes = ['/login', '/register', '/google-auth'];
  
  if (authRoutes.some(route => req.path.includes(route))) {
    return next();
  }

  const methodsRequiringCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!methodsRequiringCsrf.includes(req.method)) {
    next();
    return;
  }

  const csrfHeaderToken = req.headers['x-csrf-token'];

  if (!csrfHeaderToken || typeof csrfHeaderToken !== 'string') {
    res.status(403).json({
      code: 'CSRF_MISSING',
      message: 'CSRF token is missing from headers.'
    });
    return;
  } 

  if (!tokenUtils.verifyCsrfToken(csrfHeaderToken, req)) {
    res.status(403).json({
      code: 'CSRF_INVALID',
      message: 'Invalid CSRF token.'
    });
    return;
  }

  next();
};

export default csrfMiddleware;

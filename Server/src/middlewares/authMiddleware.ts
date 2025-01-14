import { Response, NextFunction } from 'express';
import jwtp from '../libs/jwtp';
import { authenticatedRequest } from '../types/requests/authenticatedRequest';

const JWT_SECRET = process.env.JWT_SECRET as string;

export default async function authMiddleware (
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {

  

  const accessToken = req.cookies?.['auth'] as string;
  const refreshToken = req.cookies?.['refresh_token'] as string; 
  

  // Case when no access token and no refresh token are provided
  if (!accessToken && !refreshToken) {

    req.isAuthenticated = false;
    req.user = undefined;
    
    return next();
  }

  // If an access token exists, verify it
  if (accessToken) {
    try {
      const decodedToken = await jwtp.verify(accessToken, JWT_SECRET) as any;

      req.user = {
        _id: decodedToken._id,
        username: decodedToken.username,
        accessToken,
      };
      
      req.isAuthenticated = true;
      return next();

    } catch (error) { 

      if ((error as Error).name === 'TokenExpiredError' && refreshToken) { // If the access token is invalid or expired, try using the refresh token
        try { // Verify the refresh token
          
          const decodedRefreshToken = await jwtp.verify(refreshToken, JWT_SECRET) as any;

          
          const newAccessToken = await jwtp.sign( // Issue a new access token using the refresh token
            { _id: decodedRefreshToken._id, username: decodedRefreshToken.username },
            JWT_SECRET,
            { expiresIn: '2h' }
          );

          res.cookie('auth', newAccessToken, { httpOnly: true, secure: true, sameSite: 'none' });  // Set the new access token in the response cookies
          
          req.user = { // Attach the user info to the request object
            _id: decodedRefreshToken._id,
            username: decodedRefreshToken.username,
            accessToken: newAccessToken,
          };

          req.isAuthenticated = true;

          return next();

        } catch (error) { // If the refresh token is invalid or expired, clear cookies and reject the request

          res.clearCookie('auth');
          res.clearCookie('refresh_token');

          req.isAuthenticated = false;
          req.user = undefined;

          res.status(401).json({ message: 'Authentication failed! Please log in again.' });
          return
        }
      }

      // If access token is invalid and no refresh token is available or valid
      res.clearCookie('auth');
      res.clearCookie('refresh_token');

      req.isAuthenticated = false;
      req.user = undefined;
      
      res.status(401).json({ message: 'You are not authorized!' });
      return
    }
  }

  // If no access token but a refresh token exists (fallback)

  if (refreshToken) {
    try {
      const decodedRefreshToken = await jwtp.verify(refreshToken, JWT_SECRET) as any;

      

      const newAccessToken = await jwtp.sign( // Issue a new access token using the refresh token
        { _id: decodedRefreshToken._id, username: decodedRefreshToken.username },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      
      res.cookie('auth', newAccessToken, { httpOnly: true, secure: true, sameSite: 'none' }); // Set the new access token in the response cookies

      
      
      req.user = { // Attach the user info to the request object
        _id: decodedRefreshToken._id,
        username: decodedRefreshToken.username,
        accessToken: newAccessToken,
      };

      req.isAuthenticated = true;

      return next();

    } catch (error) { // If the refresh token is invalid or expired, clear cookies and reject the request
      

      res.clearCookie('auth');
      res.clearCookie('refresh_token');

      req.isAuthenticated = false;
      req.user = undefined;

      res.status(401).json({ message: 'Authentication failed! Please log in again.' });

      return 
    }
  }
};

/* 
  Middleware that checks for the presence of an access token and refresh token in the request cookies.

  - If an access token is present, it is verified and user info is added to the request object.
  - If the access token is invalid or expired, the refresh token is verified and a new access token is issued.

  - If only the refresh token is present, a new access token is issued.
  - If the refresh token is invalid or expired, the request is rejected.

  - If neither token is present, the request is rejected.
*/

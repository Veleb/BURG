import ServerlessHttp from 'serverless-http';
import app from '../src/index';

export default ServerlessHttp(app);
// export default app;
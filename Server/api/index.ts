import serverlessHttp from 'serverless-http';
import initializeApp from '../src/index';

const handlerPromise = initializeApp.then((app) => serverlessHttp(app));

export default async (event: any, context: any) => {
  const handler = await handlerPromise;
  return handler(event, context);
};

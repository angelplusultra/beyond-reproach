// src/extensions/users-permissions/strapi-server.js
import user from './content-types/user';
import controller from './controllers/controller';
import middleware from './middlewares/middleware';

export default (plugin: any) => {
  plugin.contentTypes.user = user;
  // const register = plugin.controllers.auth.register;

  plugin.policies.validateBody = () => {
    console.log('policy time');
  };
  // TODO CREATE A ROUTE AND CONTROLLER FOR POST-MEMBERSHIP SUBSCRIPTION SUCCESS

  plugin.controllers.auth.register = controller.register;
  plugin.controllers.auth.test = async () => {
    return 'Holy fuck it worked';
  };

  const registerRoute = plugin.routes['content-api'].routes.find((route: any) => {
    if (route.path === '/auth/local/register' && route.method === 'POST') {
      return route;
    }
  });

  registerRoute.config.middlewares = [...registerRoute.config.middlewares, middleware.validateZipCode];

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/auth/test',
    handler: 'auth.test',
    config: {
      prefix: '',
      middlewares: [
        async (_: any, next: any) => {
          console.log('Middleware!');
          return next();
        }
      ]
    }
  });

  return plugin;
};

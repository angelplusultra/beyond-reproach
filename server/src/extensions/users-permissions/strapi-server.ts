// src/extensions/users-permissions/strapi-server.js
import user from './content-types/user';
import controller from './controllers/users';
import middleware from './middlewares/users';

export default (plugin: API.Auth.UsersPermissionsPlugin) => {
  plugin.contentTypes.user = user;

  plugin.controllers.auth.register = controller.register;
  plugin.controllers.auth.onMembershipCheckoutSuccess = controller.onMembershipCheckoutSuccess;

  const registerRoute = plugin.routes['content-api'].routes.find((route) => {
    if (route.path === '/auth/local/register' && route.method === 'POST') {
      return route;
    }
  });

  registerRoute &&
    (registerRoute.config.middlewares = [...registerRoute.config.middlewares, middleware.validateZipCode]);

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/auth/membership',
    handler: 'auth.onMembershipCheckoutSuccess',
    config: {
      prefix: '',
      auth: false,
      middlewares: [middleware.validateCheckoutSession]
    }
  });

  return plugin;
};

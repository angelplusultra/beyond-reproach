/**
 * order router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/order';

export default factories.createCoreRouter('api::order.order', {
  config: {
    create: {
      middlewares: [middleware.preventOrder, middleware.validateMealQuantity]
    }
  }
});

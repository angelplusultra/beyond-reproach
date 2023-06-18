/**
 * cart-item-snack router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/cart-item-snack';
export default factories.createCoreRouter('api::cart-item-snack.cart-item-snack', {
  config: {
    create: {
      middlewares: [middleware.validateCreateRequestBodySchema, middleware.validateCartDayOwnership]
    },
    update: {
      middlewares: [middleware.validateCartItemSnackOwnership]
    },
    delete: {
      middlewares: [middleware.validateCartItemSnackOwnership]
    }
  }
});

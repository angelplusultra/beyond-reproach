/**
 * cart-item-salad router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/cart-item-salad';
export default factories.createCoreRouter('api::cart-item-salad.cart-item-salad', {
  config: {
    create: {
      middlewares: [middleware.validateCreateRequestBodySchema, middleware.validateCartDayOwnership]
    },
    update: {
      middlewares: [middleware.validateCartItemSaladOwnership]
    },
    delete: {
      middlewares: [middleware.validateCartItemSaladOwnership]
    }
  }
});

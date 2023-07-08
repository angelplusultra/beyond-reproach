/**
 * cart-item-add-on router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/cart-item-add-on';

export default factories.createCoreRouter('api::cart-item-add-on.cart-item-add-on', {
  config: {
    create: {
      middlewares: [middleware.validateCreateRequestBodySchema, middleware.validateCartDayOwnership]
    },
    update: {
      middlewares: [middleware.validateCartItemAddOnOwnership]
    },
    delete: {
      middlewares: [middleware.validateCartItemAddOnOwnership]
    }
  }
});

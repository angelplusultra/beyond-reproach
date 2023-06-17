/**
 * cart-item-bundle router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/cart-item-bundle';

export default factories.createCoreRouter('api::cart-item-bundle.cart-item-bundle', {
  config: {
    create: {
      middlewares: [middleware.validateCreateRequestBodySchema, middleware.validateDayCartOwnsership]
    },
    update: {
      middlewares: [middleware.validateCartItemBundleOwnership]
    },
    delete: {
      middlewares: [middleware.validateCartItemBundleOwnership]
    }
  }
});

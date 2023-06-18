/**
 * cart-item-meal router
 */

import { factories } from '@strapi/strapi';
import middleware from '../middlewares/cart-item-meal';

export default factories.createCoreRouter('api::cart-item-meal.cart-item-meal', {
  config: {
    create: {
      middlewares: [middleware.validateCreateRequestBodySchema, middleware.validateCartDayOwnership]
    },
    update: {
      middlewares: [middleware.validateCartMealItemOwnership]
    },
    delete: {
      middlewares: [middleware.validateCartMealItemOwnership]
    }
  }
});

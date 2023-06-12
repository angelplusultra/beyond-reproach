/**
 * cart controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::cart.cart', ({ strapi }) => {
  const cart = strapi.service;
  return {
    async create() {
      const cart = await strapi.service('api::cart.cart').create({
        data: {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          user: 1
        },
        populate: {
          user: true
        }
      });

      return cart;
    },
    async update() {}
  };
});

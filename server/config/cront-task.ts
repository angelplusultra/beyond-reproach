export default {
  purgeCarts: {
    task: async ({ strapi }: { strapi: Strapi.Strapi }) => {
      await strapi.db.query('api::cart-item-meal.cart-item-meal').deleteMany({});

      await strapi.db.query('api::cart-item-salad.cart-item-salad').deleteMany({});

      await strapi.db.query('api::cart-item-snack.cart-item-snack').deleteMany({});

      await strapi.db.query('api::cart-item-bundle.cart-item-bundle').deleteMany({});
      await strapi.db.query('api::cart.cart').updateMany({
        data: {
          total: 0
        }
      });

      await strapi.db.query('plugin::users-permissions.user').updateMany({
        data: {
          placed_order: false
        }
      });

      strapi.log.info('Carts purged and Users reset');
    },
    options: {
      rule: '*/50 * * * * *',
      tz: 'America/New_York'
    }
  }
};

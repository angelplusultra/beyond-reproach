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

      strapi.log.info('Carts purged');
    },
    options: {
      // cron string scheduling

      // every 5 minutes
      // cron: '*/5 * * * *',
      rule: '*/20 * * * * *',
      tz: 'America/New_York'
    }
  }
};

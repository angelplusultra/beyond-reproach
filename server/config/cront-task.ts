import { client } from './twilio';

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
  },
  testText: {
    task: async ({ strapi }: { strapi: Strapi.Strapi }) => {
      const numbers = ['+19494909453', '+15593672828'];

      for (const number of numbers) {
        try {
          await client.messages.create({
            body: 'This is a test text from Strapi',
            from: process.env.TWILIO_SERVICE_SID,
            to: number
          });
        } catch (error: any) {
          if (error.code === 21614) {
            strapi.log.info('Test text not sent because number is not verified');
            continue;
          }

          if (error.code === 21610) {
            continue;
          }

          strapi.log.error(error.message);
        }
      }
      strapi.log.info('Messages Sent!');
    },
    options: {
      rule: '*/20 * * * * *',
      tz: 'America/New_York'
    }
  }
};

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
      rule: '*/20 * * * * *',
      tz: 'America/New_York'
    }
  },
  sendEmails: {
    task: async ({ strapi }: { strapi: Strapi.Strapi }) => {
      // const emails = ['macfittondev@gmail.com', 'marcellofitton@gmail.com', 'lareye1996@gmail.com'];
      // await Promise.all(
      //   emails.map(async (email) => {
      //     await strapi.plugins['email'].services.email.send({
      //       to: email,
      //       subject: 'Test Email',
      //       text: 'Hello world!',
      //       html: 'Hello world!'
      //     });
      //   })
      // );
    },
    options: {
      rule: '*/40 * * * * *'
    }
  }
};

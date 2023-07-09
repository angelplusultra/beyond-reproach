import globalUtils from '../../../../utils/global';

const environment = process.env.NODE_ENV;

export default {
  async afterCreate(event: API.Event<API.Order.Order>) {
    const { result, params } = event;
    const nextMonday = globalUtils.getNextMonday();
    const nextFriday = globalUtils.getNextFriday();

    try {
      const user = (await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: params.data.user }
      })) as API.Auth.User;

      if (environment === 'development') {
        await strapi.plugins['email'].services.email.send({
          to: process.env.DEVELOPMENT_TEST_EMAIL,
          subject: `Order Breakdown for the week of ${nextMonday} - ${nextFriday}`,
          html: result.order
        });
      } else if (environment === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: user.email,
          subject: `Order Breakdown for the week of ${nextMonday} - ${nextFriday}`,
          html: result.order
        });

        await strapi.plugins['email'].services.email.send({
          to: process.env.BEYOND_REPROACH_ORDERS_EMAIL,
          subject: `Order Breakdown for the week of ${nextMonday} - ${nextFriday}`,
          html: result.order
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
      }
    }
  }
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Strapi.Strapi }) {
    const cartDay = strapi.service('api::cart-day.cart-day');
    const cart = strapi.service('api::cart.cart');

    strapi.db.lifecycles.subscribe({
      //@ts-ignore
      models: ['plugin::users-permissions.user'],
      async afterCreate(event) {
        //@ts-ignore
        const myCart = await cart.create({
          data: {
            //@ts-ignore
            user: event.result.id
          },
          populate: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true
          }
        });

        const mondaySheet = await cartDay.create({
          data: {}
        });
        const tuesdaySheet = await cartDay.create({
          data: {}
        });
        const wednesdaySheet = await cartDay.create({
          data: {}
        });
        const thursdaySheet = await cartDay.create({
          data: {}
        });
        const fridaySheet = await cartDay.create({
          data: {}
        });

        const sheets = {
          mondaySheet,
          tuesdaySheet,
          wednesdaySheet,
          thursdaySheet,
          fridaySheet
        };

        console.log(sheets);

        const updatedCart = await cart.update(myCart.id, {
          data: {
            days: [mondaySheet.id, tuesdaySheet.id, wednesdaySheet.id, thursdaySheet.id, fridaySheet.id]
          },
          populate: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true
          }
        });

        console.log(updatedCart);
      },
      async beforeCreate(event) {
        // beforeCreate lifeclcyle
      }
    });
  }
};

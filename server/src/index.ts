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
    const daySheet = strapi.service('api::day-sheet.day-sheet');
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
          }
        });
        const mondaySheet = await daySheet.create({
          data: {
            cart: myCart.id,
            lunches: [],
            dinners: [],
            bundles: []
          }
        });
        const tuesdaySheet = await daySheet.create({
          data: {
            cart: myCart.id,
            lunches: [],
            dinners: [],
            bundles: []
          }
        });
        const wednesdaySheet = await daySheet.create({
          data: {
            cart: myCart.id,
            lunches: [],
            dinners: [],
            bundles: []
          }
        });
        const thursdaySheet = await daySheet.create({
          data: {
            cart: myCart.id,
            lunches: [],
            dinners: [],
            bundles: []
          }
        });
        const fridaySheet = await daySheet.create({
          data: {
            cart: myCart.id,
            lunches: [],
            dinners: [],
            bundles: []
          }
        });

        const updatedCart = await cart.update(myCart.id, {
          data: {
            monday: mondaySheet.id,
            tuesday: tuesdaySheet.id,
            wednesday: wednesdaySheet.id,
            thursday: thursdaySheet.id,
            friday: fridaySheet.id
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

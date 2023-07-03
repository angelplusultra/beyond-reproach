/**
 * cart controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::cart.cart', ({ strapi }) => {
  return {
    async find(ctx: API.Context) {
      let message;

      try {
        const myCart = await strapi.db.query('api::cart.cart').findOne({
          where: { user: ctx.state.user.id },
          populate: {
            //@ts-ignore
            days: {
              populate: {
                lunches: {
                  populate: {
                    accommodate_allergies: true,
                    meal: true,
                    protein_substitute: true,
                    omitted_ingredients: true
                  }
                },
                dinners: {
                  populate: {
                    accommodate_allergies: true,
                    meal: true,
                    protein_substitute: true,
                    omitted_ingredients: true
                  }
                },
                bundles: {
                  populate: {
                    lunch: true,
                    dinner: true,
                    lunch_protein_substitute: true,
                    dinner_protein_substitute: true,
                    lunch_accommodate_allergies: true,
                    dinner_accommodate_allergies: true,
                    lunch_omitted_ingredients: true,
                    dinner_omitted_ingredients: true,
                    bundle_snack: true
                  }
                },
                snacks: {
                  populate: {
                    snack: true
                  }
                },
                salads: {
                  populate: {
                    salad: true,
                    omitted_ingredients: true
                  }
                }
              }
            }
          }
        });

        if (!myCart) {
          message = 'Something went wrong when retrieving cart';
          return ctx.badRequest(message);
        }

        message = 'Cart successfully retrieved';
        const response = {
          message: message,
          cart: myCart
        };
        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          ctx.badRequest(error.message, {
            error
          });
        }
      }
    }
  };
});

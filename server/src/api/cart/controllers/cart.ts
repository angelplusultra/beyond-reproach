/**
 * cart controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart.cart', ({ strapi }) => {
  const carts = strapi.service('api::cart.cart') as GenericService;
  return {
    async find(ctx: API.Context) {
      let message;

      try {
        const myCart = (await carts.find!({
          filters: { user: ctx.state.user.id },
          populate: {
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
                },
                add_ons: true
              }
            }
          }
        })) as API.Cart.CartQuery;

        if (!myCart) {
          message = 'Something went wrong when retrieving cart';
          return ctx.badRequest(message);
        }

        message = 'Cart successfully retrieved';
        const response = {
          message: message,
          cart: myCart.results[0]
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

/**
 * cart-item-bundle controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart-item-bundle.cart-item-bundle', ({ strapi }) => {
  const bundleItems = strapi.service('api::cart-item-bundle.cart-item-bundle') as GenericService;
  const meals = strapi.service('api::meal.meal') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;
  //   const snacks = strapi.service('api:snack.snack') as GenericService

  return {
    /*
    @desc Creates a new Cart-Item-Bundle entry
    @route POST /api/cart-item-bundles
    @access Private
    */
    async create(ctx: API.Context<API.Cart.CreateNewCartItemBundleRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const lunch = await meals.findOne!(ctx.request.body.lunch, {});

      if (!lunch) {
        return ctx.badRequest('No lunch exists with the provided ID');
      }

      const dinner = await meals.findOne!(ctx.request.body.dinner, {});

      if (!dinner) {
        return ctx.badRequest('No dinner exists with the provided ID');
      }

      const newBundleItem: API.Cart.CartItemBundle = await bundleItems.create!({
        data: {
          lunch: ctx.request.body.lunch,
          dinner: ctx.request.body.dinner,
          quantity: ctx.request.body.quantity,
          bundle_snack: ctx.request.body.bundle_snack,
          lunch_protein_substitute: ctx.request.body.lunch_protein_substitute,
          dinner_protein_substitute: ctx.request.body.dinner_protein_substitute,
          lunch_accommodate_allergies: ctx.request.body.lunch_accommodate_allergies,
          dinner_accommodate_allergies: ctx.request.body.dinner_accommodate_allergies,
          lunch_omitted_ingredients: ctx.request.body.lunch_omitted_ingredients,
          dinner_omitted_ingredients: ctx.request.body.dinner_omitted_ingredients,
          cart_day: ctx.request.body.cart_day,
          user: ctx.state.user.id,
          total: (lunch.price + dinner.price) * ctx.request.body.quantity
        }
      });

      const updatedCartDay: API.Cart.CartDay = await cartDays.update!(cartDay.id, {
        data: {
          bundles: [...cartDay.bundles, newBundleItem.id]
        },
        populate: {
          lunches: true,
          dinners: true,
          bundles: true
        }
      });

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      const updatedCart = await carts.update!(myCart.results[0].id, {
        data: {
          total: myCart.results[0].total + newBundleItem.total
        }
      });
      return {
        updatedCartDay,
        updatedCart
      };
    },
    /*
    @desc Updates a Cart-Item-Bundle entry by incrementing its quantity
    @route PUT /api/cart-item-bundles/:id
    @access Private
    */
    async update(ctx: API.Context<null>) {
      const bundle = ctx.state.bundleItem;

      if (bundle) {
        const updatedBundle: API.Cart.CartItemBundle = await bundleItems.update!(bundle.id, {
          data: {
            quantity: bundle.quantity + 1,
            total: (bundle.lunch.price + bundle.dinner.price) * (bundle.quantity + 1)
          }
        });
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + (bundle.lunch.price + bundle.dinner.price)
          }
        });
        return {
          updatedBundle,
          updatedCart
        };
      }
    },
    /*
    @desc Deletes a Cart-Item-Bundle entry or decrements its quantity
    @route DELETE /api/cart-item-bundles/:id
    @access Private
    */
    async delete(ctx: API.Context<null>) {
      const bundle = ctx.state.bundleItem;

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      let message, updatedCart, updatedBundleItem;

      if (bundle && bundle.quantity > 1) {
        updatedBundleItem = await bundleItems.update!(ctx.params.id, {
          data: {
            quantity: bundle.quantity - 1,
            total: (bundle.lunch.price + bundle.dinner.price) * (bundle.quantity - 1)
          }
        });

        updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - (bundle.lunch.price + bundle.dinner.price)
          }
        });

        message = 'Bundle Item quantity decremented';
      } else if (bundle && bundle.quantity === 1) {
        await bundleItems.delete!(bundle.id as never, {});

        updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - (bundle.lunch.price + bundle.dinner.price)
          }
        });

        message = 'Bundle Item deleted';
      }
      return {
        updatedCart,
        updatedBundleItem,
        message
      };
    }
  };
});

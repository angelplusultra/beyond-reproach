/**
 * cart-item-snack controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart-item-snack.cart-item-snack', ({ strapi }) => {
  const snackItems = strapi.service('api::cart-item-snack.cart-item-snack') as GenericService;
  const snacks = strapi.service('api::snack.snack') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;

  return {
    async create(ctx: API.Context<API.Cart.CreateNewCartItemSnackRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const snack = await snacks.findOne!(ctx.request.body.snack, {});

      if (!snack) {
        return ctx.badRequest('No Snack exists with the provided Id');
      }

      const newSnackItem: API.Cart.CartItemSalad = await snackItems.create!({
        data: {
          snack: ctx.request.body.snack,
          quantity: ctx.request.body.quantity,
          cart_day: ctx.request.body.cart_day,
          user: ctx.state.user.id
        }
      });

      const updatedCartDay: API.Cart.CartDay = await cartDays.update!(cartDay.id, {
        data: {
          snacks: [...cartDay.snacks, newSnackItem.id]
        },
        populate: {
          snacks: true
        }
      });

      return updatedCartDay;
    },

    async update(ctx: API.Context<null>) {
      if (!ctx.state.snackItem) {
        return ctx.badRequest('No Snack Item is appended to ctx.state');
      }
      const updatedSnackItem: API.Cart.CartItemSnack = await snackItems.update!(ctx.state.snackItem.id, {
        data: {
          quantity: ctx.state.snackItem.quantity + 1
        }
      });
      return updatedSnackItem;
    },
    async delete(ctx: API.Context<null>) {
      const snackItem = ctx.state.snackItem;

      if (!snackItem) {
        return ctx.badRequest('No Snack Item is appended to ctx.state');
      }
      if (snackItem.quantity > 1) {
        const decrementedSnackItem = await snackItems.update!(ctx.params.id, {
          data: {
            quantity: snackItem.quantity - 1
          }
        });

        return {
          decrementedSnackItem,
          message: 'Snack item has been decremented'
        };
      } else if (snackItem.quantity === 1) {
        await snackItems.delete!(snackItem.id as never, {});

        return 'Item has been completely Deleted';
      }
    }
  };
});

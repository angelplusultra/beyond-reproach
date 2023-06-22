/**
 * cart-item-snack controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';
import snack from '../../snack/controllers/snack';

export default factories.createCoreController('api::cart-item-snack.cart-item-snack', ({ strapi }) => {
  const snackItems = strapi.service('api::cart-item-snack.cart-item-snack') as GenericService;
  const snacks = strapi.service('api::snack.snack') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;

  return {
    /*
    @desc Creates a new Cart-Item-Snack entry
    @route POST /api/cart-item-snacks
    @access Private
    */
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
          user: ctx.state.user.id,
          total: snack.price * ctx.request.body.quantity
        }
      });

      const updatedCartDay: API.Cart.CartDay = await cartDays.update!(cartDay.id, {
        data: {
          snacks: [...cartDay.snacks, newSnackItem.id]
        },
        populate: {
          lunches: true,
          dinners: true,
          bundles: true,
          salads: true,
          snacks: true
        }
      });

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      const updatedCart = await carts.update!(myCart.results[0].id, {
        data: {
          total: myCart.results[0].total + newSnackItem.total
        }
      });

      return {
        updatedCartDay,
        updatedCart
      };
    },

    /*
    @desc Updates a Cart-Item-Snack entry by incrementing the quantity of the Cart-Item-Snack entry
    @route PUT /api/cart-item-snacks/:id
    @access Private
    */
    async update(ctx: API.Context<null>) {
      const snackItem = ctx.state.snackItem;
      if (!snackItem) {
        return ctx.badRequest('No Snack Item is appended to ctx.state');
      }
      const updatedSnackItem: API.Cart.CartItemSnack = await snackItems.update!(snackItem.id, {
        data: {
          quantity: snackItem.quantity + 1,
          total: snackItem.snack.price * (snackItem.quantity + 1)
        }
      });

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      const updatedCart = await carts.update!(myCart.results[0].id, {
        data: {
          total: myCart.results[0].total + snackItem.snack.price
        }
      });

      return {
        updatedSnackItem,
        updatedCart
      };
    },
    /*
    @desc Deletes a Cart-Item-Snack entry or decrements the quantity of the Cart-Item-Snack entry
    @route DELETE /api/cart-item-snacks/:id
    @access Private
    */

    async delete(ctx: API.Context<null, API.Cart.CartItemDeleteRequestQuery>) {
      const snackItem = ctx.state.snackItem;
      let message, updatedCart, updatedSnackItem;

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      const deleteAll = ctx.request.query.all;

      if (deleteAll === 'true' && snackItem) {
        updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - snackItem.total
          }
        });

        updatedSnackItem = await snackItems.delete!(snackItem.id as never, {});

        message = 'Snack Item has been deleted';
      } else {
        if (snackItem && snackItem.quantity > 1) {
          updatedSnackItem = await snackItems.update!(ctx.params.id, {
            data: {
              quantity: snackItem.quantity - 1,
              total: snackItem.snack.price * (snackItem.quantity - 1)
            }
          });

          updatedCart = await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total - snackItem.snack.price
            }
          });

          message = 'Snack item quantity has been decremented';
        } else if (snackItem && snackItem.quantity === 1) {
          await snackItems.delete!(snackItem.id as never, {});

          updatedCart = await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total - snackItem.snack.price
            }
          });

          message = 'Snack item has been deleted';
        }
      }
      return {
        updatedCart,
        updatedSnackItem,
        message
      };
    }
  };
});

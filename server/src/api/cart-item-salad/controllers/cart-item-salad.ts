/**
 * cart-item-salad controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart-item-salad.cart-item-salad', ({ strapi }) => {
  const saladItems = strapi.service('api::cart-item-salad.cart-item-salad') as GenericService;
  const salads = strapi.service('api::salad.salad') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;

  return {
    async create(ctx: API.Context<API.Cart.CreateNewCartItemSaladRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const salad = await salads.findOne!(ctx.request.body.salad, {});

      if (!salad) {
        return ctx.badRequest('No Salad exists with the provided ID');
      }

      const newSaladItem: API.Cart.CartItemSalad = await saladItems.create!({
        data: {
          salad: ctx.request.body.salad,
          quantity: ctx.request.body.quantity,
          omitted_ingredients: ctx.request.body.omitted_ingredients,
          cart_day: ctx.request.body.cart_day,
          user: ctx.state.user.id,
          total: salad.price * ctx.request.body.quantity
        }
      });
      // Move to schema validation middleware

      const updatedCartDay: API.Cart.CartDay = await cartDays.update!(cartDay.id, {
        data: {
          salads: [...cartDay.salads, newSaladItem.id]
        },
        populate: {
          salads: true,
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
          total: myCart.results[0].total + newSaladItem.total
        }
      });

      return {
        updatedCartDay,
        updatedCart
      };
    },

    async update(ctx: API.Context<null>) {
      const saladItem = ctx.state.saladItem;
      if (!saladItem) {
        return ctx.badRequest('No Salad Item is appended to ctx.state');
      }
      const updatedSaladItem: API.Cart.CartItemSalad = await saladItems.update!(saladItem.id, {
        data: {
          quantity: saladItem.quantity + 1,
          total: saladItem.salad.price * (saladItem.quantity + 1)
        }
      });

      const myCart = (await carts.find!({
        filters: {
          user: ctx.state.user.id
        }
      })) as API.Cart.CartQuery;

      const updatedCart = await carts.update!(myCart.results[0].id, {
        data: {
          total: myCart.results[0].total + saladItem.salad.price
        }
      });
      return {
        updatedSaladItem,
        updatedCart
      };
    },
    async delete(ctx: API.Context<null>) {
      const saladItem = ctx.state.saladItem;

      if (!saladItem) {
        return ctx.badRequest('No Salad Item is appended to ctx.state');
      }
      if (saladItem.quantity > 1) {
        const decrementedSaladItem = await saladItems.update!(ctx.params.id, {
          data: {
            quantity: saladItem.quantity - 1,
            total: saladItem.salad.price * (saladItem.quantity - 1)
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - saladItem.salad.price
          }
        });

        return {
          decrementedSaladItem,
          updatedCart,
          message: 'Salad item has been decremented'
        };
      } else if (saladItem.quantity === 1) {
        await saladItems.delete!(saladItem.id as never, {});

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - saladItem.salad.price
          }
        });

        return {
          updatedCart,
          message: 'Item has been completely Deleted'
        };
      }
    }
  };
});

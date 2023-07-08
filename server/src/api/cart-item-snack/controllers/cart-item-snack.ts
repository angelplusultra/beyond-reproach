/**
 * cart-item-snack controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart-item-snack.cart-item-snack', ({ strapi }) => {
  const snackItems = strapi.service('api::cart-item-snack.cart-item-snack') as GenericService;
  const snacks = strapi.service('api::snack.snack') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;
  const environment = process.env.NODE_ENV;

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

      const day = cartDay.day[0].toUpperCase() + cartDay.day.slice(1);

      try {
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

        await cartDays.update!(cartDay.id, {
          data: {
            snacks: [...cartDay.snacks, newSnackItem.id]
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + newSnackItem.total
          }
        });

        const response = {
          message: `You have successfully added a new Salad Item to your cart for ${day}`,
          ...(environment === 'development' && { snack_item: newSnackItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
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

      try {
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

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + snackItem.snack.price
          }
        });

        const response = {
          message: 'Snack item quantity has been incremented',
          ...(environment === 'development' && { snack_item: updatedSnackItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
    },
    /*
    @desc Deletes a Cart-Item-Snack entry or decrements the quantity of the Cart-Item-Snack entry
    @route DELETE /api/cart-item-snacks/:id
    @access Private
    */

    async delete(ctx: API.Context<null, API.Cart.CartItemDeleteRequestQuery>) {
      const snackItem = ctx.state.snackItem;
      let message, updatedSnackItem;

      try {
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const deleteAll = ctx.request.query.all;

        if (deleteAll === 'true' && snackItem) {
          await carts.update!(myCart.results[0].id, {
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

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - snackItem.snack.price
              }
            });

            message = 'Snack item quantity has been decremented';
          } else if (snackItem && snackItem.quantity === 1) {
            updatedSnackItem = await snackItems.delete!(snackItem.id as never, {});

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - snackItem.snack.price
              }
            });

            message = 'Snack item has been deleted';
          }
        }
        const response = {
          message,
          ...(environment === 'development' && { snack_item: updatedSnackItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
    }
  };
});

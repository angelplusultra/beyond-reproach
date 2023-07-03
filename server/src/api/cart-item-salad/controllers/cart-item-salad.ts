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
  const environment = process.env.NODE_ENV;

  return {
    /*
    @desc Creates a new Cart-Item-Salad entry
    @route POST /api/cart-item-salads
    @access Private
    */
    async create(ctx: API.Context<API.Cart.CreateNewCartItemSaladRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const day = cartDay.day[0].toUpperCase() + cartDay.day.slice(1);

      try {
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

        await cartDays.update!(cartDay.id, {
          data: {
            salads: [...cartDay.salads, newSaladItem.id]
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + newSaladItem.total
          }
        });

        const response = {
          message: `Successfully added a new Salad Item to your cart for ${day}`,
          ...(environment === 'development' && { salad_item: newSaladItem })
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
    @desc Updates a Cart-Item-Salad entry by incrementing the quantity of the Cart-Item-Salad entry
    @route PUT /api/cart-item-salads/:id
    @access Private
    */
    async update(ctx: API.Context<null>) {
      const saladItem = ctx.state.saladItem;
      if (!saladItem) {
        return ctx.badRequest('No Salad Item is appended to ctx.state');
      }
      try {
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

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + saladItem.salad.price
          }
        });
        const response = {
          message: 'Salad Item quantity has been incremented by 1',
          ...(environment === 'development' && { salad_item: updatedSaladItem })
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
    @desc Deletes a Cart-Item-Salad entry or decrements the quantity of the Cart-Item-Salad entry
    @route DELETE /api/cart-item-salads/:id
    @access Private
    */
    async delete(ctx: API.Context<null, API.Cart.CartItemDeleteRequestQuery>) {
      const saladItem = ctx.state.saladItem;
      let message, updatedSaladItem;

      try {
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const deleteAll = ctx.request.query.all;

        if (deleteAll === 'true' && saladItem) {
          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total - saladItem.total
            }
          });

          updatedSaladItem = await saladItems.delete!(saladItem.id as never, {});

          message = 'Salad Item has been Deleted';
        } else {
          if (saladItem && saladItem.quantity > 1) {
            updatedSaladItem = await saladItems.update!(ctx.params.id, {
              data: {
                quantity: saladItem.quantity - 1,
                total: saladItem.salad.price * (saladItem.quantity - 1)
              }
            });

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - saladItem.salad.price
              }
            });

            message = 'Salad item has been decremented';
          } else if (saladItem && saladItem.quantity === 1) {
            updatedSaladItem = await saladItems.delete!(saladItem.id as never, {});

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - saladItem.salad.price
              }
            });
            message = 'Salad item has been deleted';
          }
        }

        const response = {
          message,
          ...(environment === 'development' && { salad_item: updatedSaladItem })
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

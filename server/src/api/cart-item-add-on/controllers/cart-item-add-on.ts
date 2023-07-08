/**
 * cart-item-add-on controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::cart-item-add-on.cart-item-add-on', ({ strapi }) => {
  const addOnItems = strapi.service('api::cart-item-add-on.cart-item-add-on') as GenericService;
  const addOns = strapi.service('api::add-on.add-on') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;
  const environment = process.env.NODE_ENV;

  return {
    async create(ctx: API.Context<API.Cart.CreateNewCartItemAddOnRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const day = cartDay.day[0].toUpperCase() + cartDay.day.slice(1);

      try {
        const addOn = await addOns.findOne!(ctx.request.body.add_on, {});

        if (!addOn) {
          return ctx.badRequest('No Add-On exists with the provided ID');
        }

        const newAddOnItem: API.Cart.CartItemAddOn = await addOnItems.create!({
          data: {
            add_on: ctx.request.body.add_on,
            quantity: ctx.request.body.quantity,
            cart_day: ctx.request.body.cart_day,
            user: ctx.state.user.id,
            total: addOn.price * ctx.request.body.quantity
          }
        });

        await cartDays.update!(cartDay.id, {
          data: {
            add_ons: [...cartDay.add_ons, newAddOnItem.id]
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + newAddOnItem.total
          }
        });

        const response = {
          message: `You have successfully added a new Add-On Item to your cart for ${day}`,
          ...(environment === 'development' && { add_on_item: newAddOnItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, {
            ...(environment === 'development' && { stack: error.stack })
          });
        }
      }
    },

    async update(ctx: API.Context<null>) {
      const addOnItem = ctx.state.addOnItem;

      if (!addOnItem) {
        return ctx.badRequest('No Add-On Item is appended to state object');
      }

      try {
        const updatedAddOnItem: API.Cart.CartItemAddOn = await addOnItems.update!(addOnItem.id, {
          data: {
            quantity: addOnItem.quantity + 1,
            total: addOnItem.add_on.price * (addOnItem.quantity + 1)
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + addOnItem.add_on.price
          }
        });

        const response = {
          message: 'Add-On Item quantity has ben incremented by 1',
          ...(environment === 'development' && { add_on_item: updatedAddOnItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, {
            ...(environment === 'development' && { stack: error.stack })
          });
        }
      }
    },
    async delete(ctx: API.Context<null, API.Cart.CartItemDeleteRequestQuery>) {
      const addOnItem = ctx.state.addOnItem;
      let message, updatedAddOnItem;

      try {
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const deleteAll = ctx.request.query.all;

        if (deleteAll === 'true' && addOnItem) {
          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total - addOnItem.total
            }
          });

          updatedAddOnItem = await addOnItems.delete!(addOnItem.id as never, {});

          message = 'Add-On item has been Deleted';
        } else {
          if (addOnItem && addOnItem.quantity > 1) {
            updatedAddOnItem = await addOnItems.update!(ctx.params.id, {
              data: {
                quantity: addOnItem.quantity - 1,
                total: addOnItem.add_on.price * (addOnItem.quantity - 1)
              }
            });

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - addOnItem.add_on.price
              }
            });

            message = 'Add-On Item has been decremented';
          } else if (addOnItem && addOnItem.quantity === 1) {
            updatedAddOnItem = await addOnItems.delete!(addOnItem.id as never, {});

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - addOnItem.add_on.price
              }
            });
            message = 'Add-On item has been deleted';
          }
        }

        const response = {
          message,
          ...(environment === 'development' && { add_on_item: updatedAddOnItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, {
            ...(environment === 'development' && { stack: error.stack })
          });
        }
      }
    }
  };
});

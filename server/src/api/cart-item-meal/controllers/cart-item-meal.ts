/**
 * cart-item-meal controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

//TODO Must validate whether the subcart to be modified is owned by the user making the request, Middleware?

export default factories.createCoreController('api::cart-item-meal.cart-item-meal', ({ strapi }) => {
  const mealItems = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
  const meals = strapi.service('api::meal.meal') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;

  return {
    async create(ctx: API.Context<API.Cart.CreateNewCartItemMealRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }

      const meal = await meals.findOne!(ctx.request.body.meal, {});

      if (!meal) {
        return ctx.badRequest('No meal exists with the provided ID');
      }
      const newMealItem: API.Cart.CartItemMeal = await mealItems.create!({
        data: {
          meal: ctx.request.body.meal,
          protein_substitute: ctx.request.body.protein_substitute,
          accommodate_allergies: ctx.request.body.accommodate_allergies,
          omitted_ingredients: ctx.request.body.omitted_ingredients,
          quantity: ctx.request.body.quantity,
          cart_day: cartDay.id,
          user: ctx.state.user.id,
          total: meal.price * ctx.request.body.quantity
        }
      });
      // Move to schema validation middleware

      let updatedCartDay: API.Cart.CartDay;
      if (meal.type === 'dinner') {
        updatedCartDay = await cartDays.update!(cartDay.id, {
          data: {
            dinners: [...cartDay.dinners, newMealItem.id]
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
            total: myCart.results[0].total + newMealItem.total
          }
        });
        return {
          updatedCartDay,
          updatedCart
        };
      } else if (meal.type === 'lunch') {
        updatedCartDay = await cartDays.update!(cartDay.id, {
          data: {
            lunches: [...cartDay.lunches, newMealItem.id]
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
            total: myCart.results[0].total + newMealItem.total
          }
        });

        return {
          updatedCartDay,
          updatedCart
        };
      }
    },

    async update(ctx: API.Context<null>) {
      const meal = ctx.state.mealItem;

      if (meal) {
        const updatedMeal: API.Cart.CartItemMeal = await mealItems.update!(meal.id, {
          data: {
            quantity: meal.quantity + 1,
            total: meal.meal.price * (meal.quantity + 1)
          }
        });
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;
        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total + meal.meal.price
          }
        });

        return {
          updatedMeal,
          updatedCart
        };
      }
    },
    async delete(ctx: API.Context<null>) {
      const meal = ctx.state.mealItem;

      if (meal && meal.quantity > 1) {
        const decrementedMealItem = await mealItems.update!(ctx.params.id, {
          data: {
            quantity: meal.quantity - 1,
            total: meal.meal.price * (meal.quantity - 1)
          }
        });

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - meal.meal.price
          }
        });

        return {
          decrementedMealItem,
          updatedCart,
          message: 'Meal item has been decremented'
        };
      } else if (meal && meal.quantity === 1) {
        await mealItems.delete!(meal.id as never, {});

        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const updatedCart = await carts.update!(myCart.results[0].id, {
          data: {
            total: myCart.results[0].total - meal.meal.price
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

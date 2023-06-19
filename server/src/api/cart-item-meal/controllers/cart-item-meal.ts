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
          day: cartDay.day,
          user: ctx.state.user.id
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

        return updatedCartDay;
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

        return updatedCartDay;
      }
    },

    async update(ctx: API.Context<null>) {
      const meal: API.Cart.CartItemMeal = await mealItems.findOne!(ctx.params.id, {});
      if (meal) {
        const updatedMeal: API.Cart.CartItemMeal = await mealItems.update!(meal.id, {
          data: {
            quantity: meal.quantity + 1
          }
        });
        return updatedMeal;
      }
    },
    async delete(ctx: API.Context<null>) {
      const meal: API.Cart.CartItemMeal = await mealItems.findOne!(ctx.params.id, {});

      if (meal && meal.quantity > 1) {
        const decrementedMealItem = await mealItems.update!(ctx.params.id, {
          data: {
            quantity: meal.quantity - 1
          }
        });

        return {
          decrementedMealItem,
          message: 'Meal item has been decremented'
        };
      } else if (meal && meal.quantity === 1) {
        await mealItems.delete!(meal.id as never, {});

        return 'Item has been completely Deleted';
      }
    }
  };
});

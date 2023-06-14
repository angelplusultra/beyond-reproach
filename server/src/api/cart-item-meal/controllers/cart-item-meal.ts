/**
 * cart-item-meal controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

// Must validate whether the subcart to be modified is owned by the user making the request, Middleware?

export default factories.createCoreController('api::cart-item-meal.cart-item-meal', ({ strapi }) => {
  const mealItem = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
  const cartDay = strapi.service('api::cart-day.cart-day') as GenericService;

  return {
    async create(ctx: API.Context<API.CreateNewCartItemMealRequestBody>) {
      //1. which day cart
      // 2. Lunch or dinner
      const { type } = ctx.request.body;

      const day: API.Cart.CartDay = await cartDay.findOne!(ctx.request.body.cartDayId, {
        populate: {
          lunches: true,
          dinners: true,
          bundles: true
        }
      });

      if (!day) {
        return 'Error: No Day';
      }
      const meal: API.Cart.CartMealItem = await mealItem.create!({
        data: {
          ...ctx.request.body,
          cart_day: day.id
        }
      });
      // Move to schema validation middleware
      if (type !== 'lunch' && type !== 'dinner') {
        return "Error: Type must be of type 'dinner' or 'lunch'";
      }
      let updatedCartDay: API.Cart.CartDay;
      if (ctx.request.body.type === 'dinner') {
        updatedCartDay = await cartDay.update!(day.id, {
          data: {
            dinners: [...day.dinners, meal.id]
          },
          populate: {
            lunches: true,
            dinners: true,
            bundles: true
          }
        });

        return updatedCartDay;
      } else if (ctx.request.body.type === 'lunch') {
        updatedCartDay = await cartDay.update!(day.id, {
          data: {
            lunches: [...day.lunches, meal.id]
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
      const meal: API.Cart.CartMealItem = await mealItem.findOne!(ctx.params.id, {});
      if (meal) {
        const updatedMeal: API.Cart.CartMealItem = await mealItem.update!(meal.id, {
          data: {
            quantity: meal.quantity + 1
          }
        });
        return updatedMeal;
      }
    },
    async delete(ctx: API.Context<null>) {
      const meal: API.Cart.CartMealItem = await mealItem.findOne!(ctx.params.id, {});

      if (meal && meal.quantity > 1) {
        const decrementedMealItem = await mealItem.update!(ctx.params.id, {
          data: {
            quantity: meal.quantity - 1
          }
        });

        return {
          decrementedMealItem,
          message: 'Meal item has been decremented'
        };
      } else if (meal && meal.quantity === 1) {
        //@ts-ignore
        const deletedMealItem = await mealItem.delete(meal.id, {});

        return 'Item has been completely Deleted';
      }
    }
  };
});

/**
 * cart-item-meal controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::cart-item-meal.cart-item-meal', ({ strapi }) => {
  const mealItem = strapi.service('api::cart-item-meal.cart-item-meal');
  const cartDay = strapi.service('api::cart-day.cart-day');

  return {
    async create(ctx: API.Context<API.CreateNewCartItemMealRequestBody>) {
      //1. which day cart
      // 2. Lunch or dinner

      const day = await cartDay.findOne(ctx.request.body.cartDayId, {
        populate: {
          lunches: true,
          dinners: true,
          bundles: true
        }
      });

      if (day) {
        const meal = await mealItem.create({
          data: {
            ...ctx.request.body
          }
        });

        let updatedCartDay;

        if (ctx.request.body.type === 'dinner') {
          updatedCartDay = await cartDay.update(day.id, {
            data: {
              dinners: [...day.dinners, meal.id]
            },
            populate: {
              lunches: true,
              dinners: true,
              bundles: true
            }
          });
        } else if (ctx.request.body.type === 'lunch') {
          updatedCartDay = await cartDay.update(day.id, {
            data: {
              lunches: [...day.lunches, meal.id]
            },
            populate: {
              lunches: true,
              dinners: true,
              bundles: true
            }
          });
        }

        return updatedCartDay;
      }
    },

    async update(ctx: API.Context<null>) {
      const meal = await mealItem.findOne(ctx.params.id, {});
      if (meal) {
        const updatedMeal = await mealItem.update(meal.id, {
          data: {
            qty: meal.qty + 1
          }
        });
        return updatedMeal;
      }
    },
  };
});

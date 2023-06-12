/**
 * meal-sheet controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::meal-sheet.meal-sheet', ({ strapi }) => {
  const mealSheet = strapi.service('api::meal-sheet.meal-sheet');
  const daySheet = strapi.service('api::day-sheet.day-sheet');
  const cart = strapi.service('api::cart.cart');
  return {
    async create(ctx: API.Context<API.CreateNewMealSheetRequestBody>) {
      //@ts-ignore
      const newMealSheet = await mealSheet.create({
        data: {
          ...ctx.request.body
        }
      });
      const myDaySheet = await daySheet.findOne(ctx.request.body.daySheet, {
        populate: {
          lunches: true,
          dinners: true,
          bundles: true
        }
      });
      console.log(myDaySheet);

      let updatedDaySheet;
      if (ctx.request.body.type === 'lunch') {
        updatedDaySheet = await daySheet.update(ctx.request.body.daySheet, {
          data: {
            lunches: [...myDaySheet.lunches, newMealSheet.id],
            dinners: [...myDaySheet.dinners]
          },
          populate: {
            lunches: true,
            dinners: true,
            bundles: true
          }
        });
      } else if (ctx.request.body.type === 'dinner') {
        updatedDaySheet = await daySheet.update(ctx.request.body.daySheet, {
          data: {
            lunches: [...myDaySheet.lunches],
            dinners: [...myDaySheet.dinners, newMealSheet.id]
          },
          populate: {
            lunches: true,
            dinners: true,
            bundles: true
          }
        });
      }

      return updatedDaySheet;
    }
  };
});

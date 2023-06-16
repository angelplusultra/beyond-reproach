import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { NextFunction } from 'connect';
import * as yup from 'yup';

export default {
  async validateDayCartOwnership(ctx: API.Context<API.Cart.CreateNewCartItemMealRequestBody>, next: NextFunction) {
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
    const subCart = await cartDays.findOne!(ctx.request.body.cart_day_id, {
      populate: {
        user: true,
        lunches: true,
        dinners: true
      }
    });

    if (!subCart) {
      return ctx.badRequest('Sub Cart not found');
    }

    if (subCart.user?.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Sub Cart');
    }
    ctx.state.user.dayCart = subCart;
    return next();
  },

  async validateCreateRequestBodySchema(
    ctx: API.Context<API.Cart.CreateNewCartItemMealRequestBody>,
    next: NextFunction
  ) {
    const createCartMealItemRequestBodySchema = yup.object({
      meal: yup.number().required('meal is required').typeError('meal must be number type'),
      protein_substitute: yup.number().typeError('protein_substitute must be number type'),
      accommodate_allergies: yup
        .array()
        .of(yup.number().typeError('accommodate_allergies must be an array with only number types'))
        .typeError('accommodate_allergies must be an array with only number types'),
      omitted_ingredients: yup
        .array()
        .of(yup.number().typeError('omitted_ingredients must be an array with only number types'))
        .typeError('omitted_ingredients must be an array with only number types'),
      cart_day_id: yup.number().required('cart_day_id is required').typeError('cart_day_id must be number type'),
      quantity: yup.number().required('quantity is required').typeError('quantity must be number type')
    });

    try {
      await createCartMealItemRequestBodySchema.validate(ctx.request.body, {});
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }
    }
    return next();
  },
  async validateCartMealItemOwnership(ctx: API.Context, next: NextFunction) {
    const mealItemId = ctx.params.id;

    const mealItem: API.Cart.CartMealItem = await strapi.service('api::cart-item-meal.cart-item-meal')!.findOne!(
      mealItemId,
      {
        populate: {
          user: true
        }
      }
    );

    if (!mealItem) {
      return ctx.badRequest('Meal Item does not exist');
    }
    if (mealItem.user.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Meal Item');
    }

    return next();
  }
};

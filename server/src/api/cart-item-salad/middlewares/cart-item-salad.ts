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
        dinners: true,
        bundles: true
      }
    });

    if (!subCart) {
      return ctx.badRequest('Sub Cart not found');
    }

    if (subCart.user?.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Sub Cart');
    }
    ctx.state.user.cartDay = subCart;
    return next();
  },

  async validateCreateRequestBodySchema(
    ctx: API.Context<API.Cart.CreateNewCartItemMealRequestBody>,
    next: NextFunction
  ) {
    const createCartItemSaladRequestBodySchema = yup.object({
      salad: yup.number().required('salad is required').typeError('salad must be number type'),
      omitted_ingredients: yup
        .array()
        .of(yup.number().typeError('omitted_ingredients must be an array with only number types'))
        .typeError('omitted_ingredients must be an array with only number types'),
      cart_day_id: yup.number().required('cart_day_id is required').typeError('cart_day_id must be number type'),
      quantity: yup.number().required('quantity is required').typeError('quantity must be number type')
    });

    try {
      await createCartItemSaladRequestBodySchema.validate(ctx.request.body, {});
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }
    }
    return next();
  },
  async validateCartItemSaladOwnership(ctx: API.Context, next: NextFunction) {
    const saladItemId = ctx.params.id;

    const saladItem: API.Cart.CartItemSalad = await strapi.service('api::cart-item-meal.cart-item-meal')!.findOne!(
      saladItemId,
      {
        populate: {
          user: true
        }
      }
    );

    if (!saladItem) {
      return ctx.badRequest('Meal Item does not exist');
    }
    if (saladItem.user?.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Meal Item');
    }

    return next();
  }
};

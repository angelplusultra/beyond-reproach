import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { NextFunction } from 'connect';
import * as yup from 'yup';

export default {
  async validateCartDayOwnership(ctx: API.Context<API.Cart.CreateNewCartItemSnackRequestBody>, next: NextFunction) {
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
    const subCart = await cartDays.findOne!(ctx.request.body.cart_day, {
      populate: {
        user: true,
        snacks: true
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
    ctx: API.Context<API.Cart.CreateNewCartItemSnackRequestBody>,
    next: NextFunction
  ) {
    const createCartItemSnackRequestBodySchema = yup.object({
      snack: yup.number().required('snack is required').typeError('snack must be number type'),
      quantity: yup.number().required('quantity is required').typeError('quantity must be number type'),
      cart_day: yup.number().required('cart_day is required').typeError('cart_day must be number type')
    });

    try {
      await createCartItemSnackRequestBodySchema.validate(ctx.request.body, {});
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }
    }
    return next();
  },
  async validateCartItemSnackOwnership(ctx: API.Context, next: NextFunction) {
    const snackItemId = ctx.params.id;

    const snackItem: API.Cart.CartItemSnack = await strapi.service('api:cart-item-snack.cart-item-snack')!.findOne!(
      snackItemId,
      {
        populate: {
          user: true
        }
      }
    );

    if (!snackItem) {
      return ctx.badRequest('Snack Item does not exist');
    }
    if (snackItem.user?.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Snack Item');
    }

    ctx.state.snackItem = snackItem;

    return next();
  }
};

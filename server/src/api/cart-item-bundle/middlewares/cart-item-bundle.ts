import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { NextFunction } from 'connect';
import * as yup from 'yup';

export default {
  async validateCartDayOwnsership(ctx: API.Context<API.Cart.CreateNewCartItemBundleRequestBody>, next: NextFunction) {
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
    const subCart = await cartDays.findOne!(ctx.request.body.cart_day, {
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
      return ctx.badRequest('You are not owner of the provided Sub cart');
    }

    ctx.state.user.cartDay = subCart;
    return next();
  },

  async validateCreateRequestBodySchema(
    ctx: API.Context<API.Cart.CreateNewCartItemBundleRequestBody>,
    next: NextFunction
  ) {
    const createCartItemBundleRequestBodySchema = yup.object({
      lunch: yup.number().required('lunch is required').typeError('lunch must be number type'),
      dinner: yup.number().required('dinner is required').typeError('dinner must be number type'),
      quantity: yup.number().required('quantity is required').typeError('quantity must be number type'),
      bundle_snack: yup.number().required('bundle_snack is required').typeError('bundle_snack must be number type'),
      lunch_protein_substitute: yup.number().typeError('lunch_protein_substitute must be of number type'),
      dinner_protein_substitute: yup.number().typeError('dinner_protein_substitute must be of number type'),
      lunch_accommodate_allergies: yup
        .array()
        .of(yup.number().typeError('lunch_accomodate_allergies must be an array with only numbers'))
        .typeError('lunch_accomodate_allergies must be an array with only numbers'),
      dinner_accommodate_allergies: yup
        .array()
        .of(yup.number().typeError('dinner_accomodate_allergies must be an array with only numbers'))
        .typeError('dinner_accomodate_allergies must be an array with only numbers'),
      lunch_omitted_ingredients: yup
        .array(yup.number().typeError('lunch_omitted_ingredients must be an array with only numbers'))
        .typeError('lunch_omitted_ingredients must be an array with only numbers'),
      dinner_omitted_ingredients: yup
        .array(yup.number().typeError('dinner_omitted_ingredients must be an array with only numbers'))
        .typeError('dinner_omitted_ingredients must be an array with only numbers'),
      cart_day: yup.number().required('cart_day_id is required').typeError('cart_day_id must be number type')
    });

    try {
      await createCartItemBundleRequestBodySchema.validate(ctx.request.body);
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }
    }
    return next();
  },
  async validateCartItemBundleOwnership(ctx: API.Context, next: NextFunction) {
    const bundleItemId = ctx.params.id;

    const bundleItems = strapi.service('api::cart-item-bundle.cart-item-bundle') as GenericService;
    const bundleItem = await bundleItems.findOne!(bundleItemId, {
      populate: {
        user: true
      }
    });

    if (!bundleItem) {
      return ctx.badRequest('Bundle Item does not exist');
    }
    if (bundleItem.user.id !== ctx.state.user.id) {
      return ctx.badRequest('You are not the owner of the provided Bundle Item');
    }

    return next();
  }
};

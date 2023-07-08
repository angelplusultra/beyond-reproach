import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { NextFunction } from 'connect';
import * as yup from 'yup';

export default {
  async validateCartDayOwnership(ctx: API.Context<API.Cart.CreateNewCartItemAddOnRequestBody>, next: NextFunction) {
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;

    try {
      const subCart = await cartDays.findOne!(ctx.request.body.cart_day, {
        populate: {
          user: true,
          add_ons: true
        }
      });

      if (!subCart) {
        return ctx.badRequest('Sub Cart not found');
      }

      if (subCart.user.id !== ctx.state.user.id) {
        return ctx.badRequest('You are not the owner of the provided Sub Cart');
      }

      ctx.state.user.cartDay = subCart;
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, {
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
      }
    }
    await next();
  },

  async validateCreateRequestBodySchema(
    ctx: API.Context<API.Cart.CreateNewCartItemAddOnRequestBody>,
    next: NextFunction
  ) {
    const createCartItemAddOnRequestBodySchema = yup.object({
      add_on: yup.number().required('add_on is required').typeError('add_on must be a number type'),
      cart_day: yup.number().required('cart_day_id').typeError('cart_day_id must be number type'),
      quantity: yup.number().required('quantity is required').typeError('quantity must be a number type')
    });

    try {
      await createCartItemAddOnRequestBodySchema.validate(ctx.request.body, {});
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message, {
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
      }
    }
    await next();
  },

  async validateCartItemAddOnOwnership(ctx: API.Context, next: NextFunction) {
    const addOnItemId = ctx.params.id;

    try {
      const addOnItem: API.Cart.CartItemAddOn = await strapi.service('api::cart-item-add-on.cart-item-add-on')!
        .findOne!(addOnItemId, {
        populate: {
          user: true,
          add_on: true
        }
      });

      if (!addOnItem) {
        return ctx.badRequest('Add-On Item does not exist');
      }

      if (addOnItem.user.id !== ctx.state.user.id) {
        return ctx.badRequest('You are not the owner of the provided Add-On Item');
      }

      ctx.state.addOnItem = addOnItem;
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, {
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
      }
    }

    await next();
  }
};

import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { NextFunction } from 'connect';
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

  validateCreateRequestBodySchema() {}
};

import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { stripe } from '../../../../config/stripe';
import { NextFunction } from 'connect';

export default {
  async validateCheckoutSession(ctx: API.Context<null, API.Auth.MembershipCheckoutSuccessQuery>, next: NextFunction) {
    const session_id = ctx.request.query.session_id;

    if (!session_id) {
      return ctx.badRequest('Session ID not provided');
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.status === 'complete') {
        ctx.state.session = session;

        return next();
      } else {
        return ctx.badRequest('Checkout session is not complete');
      }
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message, { error });
      }
    }
  },
  async validateMealQuantity(ctx: API.Context, next: NextFunction) {
    const mealItems = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
    const bundleItems = strapi.service('api::cart-item-bundle.cart-item-bundle') as GenericService;

    const meals = (await mealItems.find!({
      filters: {
        user: ctx.state.user.id
      }
    })) as API.Cart.CartItemMealQuery;

    const bundles = (await bundleItems.find!({
      filters: {
        user: ctx.state.user.id
      }
    })) as API.Cart.CartItemBundleQuery;

    let mealCount = 0;

    meals.results.forEach((meal) => {
      mealCount += meal.quantity;
    });

    bundles.results.forEach((bundle) => {
      mealCount += bundle.quantity * 2;
    });

    if (mealCount < 4) {
      return ctx.badRequest('User must have at least 4 Meals or 2 Bundles in their cart to checkout');
    }

    await next();
  }
};

import { NextFunction } from 'connect';
import { stripe } from '../../../../config/stripe';

export default {
  async validateZipCode(ctx: API.Context<API.Auth.RegisterNewUserRequestBody>, next: NextFunction) {
    const whitelist = new Map([
      ['92808', true],
      ['88756', true],
      ['55764', true]
    ]);

    if (!whitelist.get(ctx.request.body.zipcode)) {
      return ctx.badRequest('Invalid zipcode');
    }
    await next();
  },

  async validateCheckoutSession(ctx: API.Context<null, API.Auth.MembershipCheckoutSuccessQuery>, next: NextFunction) {
    const session_id = ctx.request.query.session_id;

    if (!session_id) {
      return ctx.badRequest('Session ID not provided');
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.status === 'complete') {
        ctx.state.session = session;

        await next();
      } else {
        return ctx.badRequest('Checkout session is not complete');
      }
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message, { error });
      }
    }
  }
};

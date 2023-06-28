import { NextFunction } from 'connect';
import { stripe } from '../../../../config/stripe';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default {
  async validateZipCode(ctx: API.Context<API.Auth.RegisterNewUserRequestBody>, next: NextFunction) {
    const userZipCode = ctx.request.body.zipcode;
    const whitelistedZipCodes = strapi.services['api::valid-zip-code.valid-zip-code'] as GenericService;

    if (!/^\d{5}$/.test(userZipCode)) {
      return ctx.badRequest('Please format the zipcode in the xxxxx format');
    }

    const validZipCodes = (await whitelistedZipCodes?.find!({})) as API.Auth.ValidZipCodeQuery;

    const zipCodeList = validZipCodes?.results.map((validZipCode) => validZipCode.zipcode);

    if (zipCodeList.includes(userZipCode)) {
      // ZIP code is valid
      await next();
    } else {
      // Invalid ZIP code
      return ctx.badRequest('Invalid zipcode');
    }
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

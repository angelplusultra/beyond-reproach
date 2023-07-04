import { NextFunction } from 'connect';
import { stripe } from '../../../../config/stripe';
import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import * as yup from 'yup';

export default {
  async formatMobileNumber(
    ctx: API.Context<API.Auth.RegisterNewUserRequestBody | API.Auth.UpdateMeRequestBody>,
    next: NextFunction
  ) {
    const userMobileNumber = ctx.request.body.mobile_number;

    const phoneUtil = PhoneNumberUtil.getInstance();

    if (userMobileNumber) {
      try {
        const phoneNumber = phoneUtil.parse(userMobileNumber);

        if (!phoneUtil.isValidNumber(phoneNumber)) {
          return ctx.badRequest('Please provide a valid mobile number.');
        }

        const formattedMobileNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);

        ctx.request.body.mobile_number = formattedMobileNumber;
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
    }

    await next();
  },

  async validateZipCode(
    ctx: API.Context<API.Auth.RegisterNewUserRequestBody | API.Auth.UpdateMeRequestBody>,
    next: NextFunction
  ) {
    const userZipCode = ctx.request.body.zipcode;
    const whitelistedZipCodes = strapi.services['api::valid-zip-code.valid-zip-code'] as GenericService;

    if (userZipCode) {
      if (!/^\d{5}$/.test(userZipCode)) {
        return ctx.badRequest('Please format the zipcode in the xxxxx format');
      }

      try {
        const validZipCodes = (await whitelistedZipCodes?.find!({})) as API.Auth.ValidZipCodeQuery;

        const zipCodeList = validZipCodes?.results.map((validZipCode) => validZipCode.zipcode);

        if (!zipCodeList.includes(userZipCode)) {
          return ctx.badRequest('Zipcode is not in our whitelist');
        }
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
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
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }
  },

  async validateUpdateMeRequestBodySchema(ctx: API.Context<API.Auth.UpdateMeRequestBody>, next: NextFunction) {
    const updateMeRequestBodySchema = yup.object().shape(
      {
        mobile_number: yup.string(),
        street: yup
          .string()
          .typeError('street must be string type')
          .when(['zipcode', 'city'], {
            is: (zipcode: string, city: string) => zipcode || city,
            then: (schema) => schema.required('street is required')
          }),
        city: yup
          .string()
          .typeError('city must be string type')
          .when(['street', 'zipcode'], {
            is: (street: string, zipcode: string) => street || zipcode,
            then: (schema) => schema.required('city is required')
          }),
        zipcode: yup
          .string()
          .typeError('zipcode must be string type')
          .when(['street', 'city'], {
            is: (street: string, city: string) => street || city,
            then: (schema) => schema.required('zipcode is required')
          })
      },
      [
        ['zipcode', 'city'],
        ['street', 'zipcode'],
        ['street', 'city']
      ]
    );

    try {
      await updateMeRequestBodySchema.validate(ctx.request.body, {
        strict: true
      });
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }

    await next();
  }
};

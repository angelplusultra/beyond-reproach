import utils from '@strapi/utils';
import { getService } from '@strapi/plugin-users-permissions/server/utils';
import services from '../services/user';
import _ from 'lodash';

import { validateRegisterBody } from '@strapi/plugin-users-permissions/server/controllers/validation/auth';
import { stripe } from '../../../../config/stripe';

const { sanitize } = utils;

const { ApplicationError } = utils.errors;

const sanitizeUser = (user: unknown, ctx: API.Context<API.Auth.RegisterNewUserRequestBody>) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

export default {
  async register(ctx: API.Context<API.Auth.RegisterNewUserRequestBody>) {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    const settings = await pluginStore.get({ key: 'advanced' });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ..._.omit(ctx.request.body, [
        'confirmed',
        'blocked',
        'confirmationToken',
        'resetPasswordToken',
        'provider',
        'id',
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
        'role'
      ]),
      provider: 'local'
    };

    await validateRegisterBody(params);

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }
    const { email, username, provider } = params as { email: string; username: string; provider: string };

    const identifierFilter = {
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }, { username }, { email: username }]
    };

    const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
      where: { ...identifierFilter, provider }
    });

    if (conflictingUserCount > 0) {
      throw new ApplicationError('Email or Username are already taken');
    }

    if (settings.unique_email) {
      const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
        where: { ...identifierFilter }
      });

      if (conflictingUserCount > 0) {
        throw new ApplicationError('Email or Username are already taken');
      }
    }

    const newUser = {
      ...params,
      role: role.id,
      email: email.toLowerCase(),
      username,
      confirmed: !settings.email_confirmation
    };

    const user = await getService('user').add(newUser);

    const sanitizedUser = await sanitizeUser(user, ctx);

    if (settings.email_confirmation) {
      try {
        await getService('user').sendConfirmationEmail(sanitizedUser);
      } catch (err) {
        // ! KEEP AN EYE ON THIS
        if (err instanceof Error) {
          throw new ApplicationError(err.message);
        }
      }

      return ctx.send({ user: sanitizedUser });
    }

    const jwt = getService('jwt').issue(_.pick(user, ['id']));

    const customer = await stripe.customers.create({
      email: sanitizedUser.email,
      name: sanitizedUser.username,
      address: {
        line1: sanitizedUser.street,
        city: sanitizedUser.city,
        postal_code: sanitizedUser.zipcode,
        state: sanitizedUser.state
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: process.env.STRIPE_TEST_MEMBERSHIP_PLAN_PRICE_ID, quantity: 1 }],
      payment_method_types: ['paypal', 'card'],
      payment_method_collection: 'always',
      discounts: [{ coupon: process.env.STRIPE_TEST_MEMBERSHIP_PLAN_DISCOUNT_ID }],
      currency: 'USD',
      success_url: `${
        process.env.SERVER_BASE_URL || 'http://localhost:1337'
      }/api/auth/membership?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:1337'
    });
    // TODO SESSION LINK AND JWT, FRONTEND WILL PUT JWT IN LS

    //@ts-ignore
    ctx.send({
      session,
      customer,
      sanitizedUser,
      jwt
    });

    services.createCartRelations(sanitizedUser);
  },

  async onMembershipCheckoutSuccess(ctx: API.Context<null, API.Auth.MembershipCheckoutSuccessQuery>) {
    const users = strapi.db.query('plugin::users-permissions.user');
    await users.update({
      where: {
        email: ctx.state.session?.customer_details?.email
      },
      data: {
        role: 3
      },
      populate: { role: true }
    });

    // TODO REDIRECT USER BACK TO FRONTEND

    return ctx.redirect('https://google.com');
  },
  async updateAddress() {}
};

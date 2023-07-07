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
        if (err instanceof Error) {
          throw new ApplicationError(err.message);
        }
      }

      return ctx.send({ user: sanitizedUser });
    }

    const jwt = getService('jwt').issue(_.pick(user, ['id']));

    const users = strapi.db.query('plugin::users-permissions.user');
    try {
      const customer = await stripe.customers.create({
        email: sanitizedUser.email,
        name: sanitizedUser.username,
        address: {
          line1: sanitizedUser.street,
          city: sanitizedUser.city,
          postal_code: sanitizedUser.zipcode,
          state: sanitizedUser.state,
          country: 'US'
        },
        phone: sanitizedUser.mobile_number,
        metadata: {
          user_id: sanitizedUser.id
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
        }/api/auth/membership/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:1337',
        metadata: {
          user_id: sanitizedUser.id
        }
      });

      await users.update({
        where: {
          email: sanitizedUser.email
        },
        data: {
          stripe_customer_id: customer.id
        }
      });

      const response = {
        message: 'Your account has been successfully created!',
        session_url: session.url,
        session_id: session.id,
        jwt,
        user: sanitizedUser
      };
      await services.createCartRelations(sanitizedUser);

      ctx.send(response);
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }
  },

  async onMembershipCheckoutSuccess(ctx: API.Context<null, API.Auth.MembershipCheckoutSuccessQuery>) {
    const users = strapi.db.query('plugin::users-permissions.user');

    if (!ctx.state.session || !ctx.state.session.metadata) {
      return ctx.badRequest('Stripe session is not attached to the state object');
    }

    try {
      await users.update({
        where: {
          id: ctx.state.session.metadata.user_id
        },
        data: {
          role: 3,
          stripe_subscription_id: ctx.state.session.subscription
        },
        populate: { role: true }
      });
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }

    return ctx.redirect('https://google.com');
  },
  async becomeMember(ctx: API.Context) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: ctx.state.user.stripe_customer_id,
        line_items: [{ price: process.env.STRIPE_TEST_MEMBERSHIP_PLAN_PRICE_ID, quantity: 1 }],
        payment_method_types: ['paypal', 'card'],
        discounts: [{ coupon: process.env.STRIPE_TEST_MEMBERSHIP_PLAN_DISCOUNT_ID }],
        currency: 'USD',
        success_url: `${
          process.env.SERVER_BASE_URL || 'http://localhost:1337'
        }/api/auth/membership/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'http://localhost:1337',
        metadata: {
          user_id: ctx.state.user.id
        }
      });

      const response = {
        message: 'A checkout session for membership has been succesfully created',
        session_url: session.url
      };

      ctx.send(response);
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }
  },
  async unsubscribe(ctx: API.Context) {
    const users = strapi.db.query('plugin::users-permissions.user');

    try {
      await stripe.subscriptions.cancel(ctx.state.user.stripe_subscription_id);

      await users.update({
        where: {
          id: ctx.state.user.id
        },
        data: {
          role: 1
        },
        populate: { role: true }
      });
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }

    const response = {
      message: 'You have been successfully unsubscribed!'
    };

    ctx.send(response);
  },
  async updateMe(ctx: API.Context<API.Auth.UpdateMeRequestBody>) {
    const users = strapi.db.query('plugin::users-permissions.user');
    try {
      await users.update({
        where: {
          id: ctx.state.user.id
        },
        data: {
          ...(ctx.request.body.mobile_number && { mobile_number: ctx.request.body.mobile_number }),
          ...(ctx.request.body.street && { street: ctx.request.body.street }),
          ...(ctx.request.body.city && { city: ctx.request.body.city }),
          ...(ctx.request.body.zipcode && { zipcode: ctx.request.body.zipcode })
        }
      });

      await stripe.customers.update(ctx.state.user.stripe_customer_id, {
        ...(ctx.request.body.street &&
          ctx.request.body.city &&
          ctx.request.body.zipcode && {
            address: {
              line1: ctx.request.body.street,
              postal_code: ctx.request.body.zipcode,
              city: ctx.request.body.city
            }
          }),
        ...(ctx.request.body.mobile_number && {
          phone: ctx.request.body.mobile_number
        })
      });
    } catch (error) {
      if (error instanceof Error) {
        strapi.log.error(error.message);
        return ctx.badRequest(error.message, { error });
      }
    }
    const response = {
      message: 'Your info has been succesfully updated!'
    };
    return ctx.send(response);
  }
};

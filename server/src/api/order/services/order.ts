/**
 * order service
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { stripe } from '../../../../config/stripe';
import Stripe from 'stripe';

export default factories.createCoreService('api::order.order');

export const extraServices = {
  async createOrder(ctx: API.Context) {
    const orders = strapi.service('api::order.order') as GenericService;
    const orderDays = strapi.service('api::order-day.order-day') as GenericService;
    const orderMeals = strapi.service('api::order-meal.order-meal') as GenericService;
    const orderBundles = strapi.service('api::order-bundle.order-bundle') as GenericService;
    const orderSnacks = strapi.service('api::order-snack.order-salad') as GenericService;
    const orderSalads = strapi.service('api::order-salad.order-salad') as GenericService;
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
    const users = strapi.db.query('plugin::users-permissions.user');

    const customer = (await stripe.customers.retrieve(ctx.state.session!.customer as string)) as Stripe.Customer;

    const user: API.Auth.User = await users.findOne!({
      where: {
        id: customer.metadata.user_id
      }
    });

    const order = await orders.create!({
      data: {
        user: user.id
      }
    });

    const subCarts = (await cartDays.find!({
      filters: {
        user: user.id
      },
      populate: {
        lunches: {
          populate: {
            accommodate_allergies: true,
            meal: true,
            protein_substitute: true,
            omitted_ingredients: true
          }
        },
        dinners: {
          populate: {
            accommodate_allergies: true,
            meal: true,
            protein_substitute: true,
            omitted_ingredients: true
          }
        },
        bundles: {
          populate: {
            lunch: true,
            dinner: true,
            lunch_protein_substitute: true,
            dinner_protein_substitute: true,
            lunch_accommodate_allergies: true,
            dinner_accommodate_allergies: true,
            lunch_omitted_ingredients: true,
            dinner_omitted_ingredients: true,
            bundle_snack: true
          }
        },
        snacks: true,
        salads: {
          populate: {
            salad: true,
            omitted_ingredients: true
          }
        }
      }
    })) as API.Cart.CartDayQuery;

    const days = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: ''
    };

    await Promise.all(
      subCarts.results.map(async (cart) => {
        const orderDay = await orderDays.create!({
          data: {
            user: user.id
          }
        });

        const lunchOrders = await Promise.all(
          cart.lunches.map(async (lunch) => {
            const lunchOrder = await orderMeals.create!({
              data: {
                meal: lunch?.meal.id,
                quantity: lunch?.quantity,
                accommodate_allergies: lunch.accommodate_allergies,
                protein_substitute: lunch?.protein_substitute.id,
                omitted_ingredients: lunch?.omitted_ingredients,
                order: order.id,
                order_day: orderDay.id,
                user: user.id
              }
            });
            return lunchOrder.id;
          })
        );
        const dinnerOrders = await Promise.all(
          cart.dinners.map(async (dinner) => {
            const dinnerOrder = await orderMeals.create!({
              data: {
                meal: dinner?.meal,
                quantity: dinner?.quantity,
                accommodate_allergies: dinner?.accommodate_allergies,
                protein_substitute: dinner?.protein_substitute,
                omitted_ingredients: dinner?.omitted_ingredients,
                order: order.id,
                order_day: orderDay.id,
                user: user.id
              }
            });
            return dinnerOrder.id;
          })
        );
        const bundleOrders = await Promise.all(
          cart.bundles.map(async (bundle) => {
            const bundleOrder = await orderBundles.create!({
              data: {
                lunch: bundle?.lunch,
                dinner: bundle?.dinner,
                quantity: bundle?.quantity,
                lunch_protein_substitute: bundle?.lunch_protein_substitute,
                dinner_protein_substitute: bundle?.dinner_protein_substitute,
                lunch_accommodate_allergies: bundle?.lunch_accommodate_allergies,
                dinner_accommodate_allergies: bundle?.dinner_accommodate_allergies,
                lunch_omitted_ingredients: bundle?.lunch_omitted_ingredients,
                dinner_omitted_ingredients: bundle?.dinner_omitted_ingredients,
                bundle_snack: bundle?.bundle_snack,
                order: order.id,
                order_day: orderDay.id,
                user: user.id
              }
            });
            return bundleOrder.id;
          })
        );

        const snackOrders = await Promise.all(
          cart.snacks.map(async (snack) => {
            const snackOrder = await orderSnacks.create!({
              data: {
                snack: snack?.snack,
                quantity: snack?.quantity,
                order: order.id,
                order_day: orderDay.id,
                user: user.id
              }
            });
            return snackOrder.id;
          })
        );

        const saladOrders = await Promise.all(
          cart.salads.map(async (salad) => {
            const saladOrder = await orderSalads.create!({
              data: {
                salad: salad?.salad,
                quantity: salad?.quantity,
                omitted_ingredients: salad?.omitted_ingredients,
                order: order.id,
                user: user.id,
                order_day: orderDay.id
              }
            });
            return saladOrder.id;
          })
        );

        await orderDays.update!(orderDay.id, {
          data: {
            lunches: lunchOrders,
            dinners: dinnerOrders,
            bundles: bundleOrders,
            snacks: snackOrders,
            salads: saladOrders,
            order: order.id,
            user: user.id
          }
        });

        days[cart.day] = orderDay.id;
      })
    );
    // why aree they remaining as empty strings?

    const dayOrders = {
      monday: days.monday,
      tuesday: days.tuesday,
      wednesday: days.wednesday,
      thursday: days.thursday,
      friday: days.friday
    };

    await orders.update!(order.id, {
      data: {
        monday: dayOrders.monday,
        tuesday: dayOrders.tuesday,
        wednesday: dayOrders.wednesday,
        thursday: dayOrders.thursday,
        friday: dayOrders.friday
      }
    });
  }
};

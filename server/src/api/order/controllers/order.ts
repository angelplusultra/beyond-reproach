/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { stripe } from '../../../../config/stripe';
import { extraServices } from '../services/order';

export default factories.createCoreController('api::order.order', ({ strapi }) => {
  const cartItemMeals = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
  const cartItemBundles = strapi.service('api::cart-item-bundle.cart-item-bundle') as GenericService;
  const cartItemSnacks = strapi.service('api::cart-item-snack.cart-item-snack') as GenericService;
  const cartItemSalads = strapi.service('api::cart-item-salad.cart-item-salad') as GenericService;
  const cartItemAddOns = strapi.service('api::cart-item-add-on.cart-item-add-on') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const stagedCarts = strapi.service('api::staged-cart.staged-cart') as GenericService;
  const environment = process.env.NODE_ENV;
  const users = strapi.db.query('plugin::users-permissions.user');

  return {
    async create(ctx: API.Context) {
      try {
        const subCarts = (await cartDays.find!({
          filters: {
            user: ctx.state.user.id
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
            snacks: {
              populate: {
                snack: true
              }
            },
            salads: {
              populate: {
                salad: true,
                omitted_ingredients: true
              }
            },
            add_ons: {
              populate: {
                add_on: true
              }
            }
          }
        })) as API.Cart.CartDayQuery;

        const stagedCart = await stagedCarts.create!({
          data: {
            user: ctx.state.user.id,
            cart: subCarts.results
          }
        });

        const mealItems = (await cartItemMeals.find!({
          filters: {
            user: ctx.state.user.id
          },
          populate: {
            meal: true
          }
        })) as API.Cart.CartItemMealQuery;

        const bundleItems = (await cartItemBundles.find!({
          filters: {
            user: ctx.state.user.id
          },
          populate: {
            lunch: true,
            dinner: true
          }
        })) as API.Cart.CartItemBundleQuery;

        const snackItems = (await cartItemSnacks.find!({
          filters: {
            user: ctx.state.user.id
          },
          populate: {
            snack: true
          }
        })) as API.Cart.CartItemSnackQuery;

        const saladItems = (await cartItemSalads.find!({
          filters: {
            user: ctx.state.user.id
          },
          populate: {
            salad: true
          }
        })) as API.Cart.CartItemSaladQuery;

        const addOnItems = (await cartItemAddOns.find!({
          filters: {
            user: ctx.state.user.id
          },
          populate: {
            add_on: true
          }
        })) as API.Cart.CartItemAddOnQuery;

        const bundleLineItems = bundleItems.results.map((bundleItem: API.Cart.CartItemBundle) => {
          const lunchUnit = Math.round(bundleItem.lunch.price * 100);
          const dinnerUnit = Math.round(bundleItem.dinner.price * 100);

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Lunch and Dinner Bundle',
                description: 'lunch and dinner bundle'
              },
              unit_amount: lunchUnit + dinnerUnit
            },
            quantity: bundleItem.quantity
          };
        });
        const snackLineItems = snackItems.results.map((snackItem: API.Cart.CartItemSnack) => {
          const unit = Math.round(snackItem.snack.price * 100);

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: snackItem.snack.title
              },
              unit_amount: unit
            },
            quantity: snackItem.quantity
          };
        });
        const saladLineItems = saladItems.results.map((saladItem: API.Cart.CartItemSalad) => {
          const unit = Math.round(saladItem.salad.price * 100);

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: saladItem.salad.title
              },
              unit_amount: unit
            },
            quantity: saladItem.quantity
          };
        });

        const addOnLineItems = addOnItems.results.map((addOnItem: API.Cart.CartItemAddOn) => {
          const unit = Math.round(addOnItem.add_on.price * 100);

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: addOnItem.add_on.title
              },
              unit_amount: unit
            },
            quantity: addOnItem.quantity
          };
        });
        const mealLineItems = mealItems.results.map((mealItem: API.Cart.CartItemMeal) => {
          // Example decimal unit amount
          const unit = Math.round(mealItem.meal.price * 100);

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: mealItem.meal.title
              },
              unit_amount: unit
            },
            quantity: mealItem.quantity
          };
        });

        const customer = await stripe.customers.retrieve(ctx.state.user.stripe_customer_id);

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer: customer.id,
          // Expires in 7 days
          payment_method_types: ['card'],
          success_url: `${
            process.env.SERVER_BASE_URL || 'http://localhost:1337'
          }/api/orders/success?session_id={CHECKOUT_SESSION_ID}`,
          line_items: [...mealLineItems, ...bundleLineItems, ...snackLineItems, ...saladLineItems, ...addOnLineItems],
          automatic_tax: {
            enabled: true
          },
          metadata: {
            user_id: ctx.state.user.id,
            user_email: ctx.state.user.email,
            staged_cart_id: stagedCart.id
          }
        });

        ctx.send({
          session_url: session.url,
          session_id: session.id,
          message: 'A checkout session has been created'
        });
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { ...(environment === 'development' && { stack: error.stack }) });
        }
      }
    },
    async onOrderCheckoutSuccess(ctx: API.Context) {
      if (!ctx.state.session?.metadata?.user_id) {
        return ctx.badRequest('user_id is not attached to session metadata');
      }

      const response = {
        message: 'Order checkout success'
      };
      try {
        await users.update!({
          where: { id: ctx.state.session.metadata.user_id },
          data: {
            placed_order: true
          }
        });
        await extraServices.createOrder(ctx);
        await extraServices.postOrderCleanup(ctx);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { ...(environment === 'development' && { stack: error.stack }) });
        }
      }

      ctx.send(response);
    }
  };
});

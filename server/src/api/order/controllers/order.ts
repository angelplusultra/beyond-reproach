/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';
import { stripe } from '../../../../config/stripe';

export default factories.createCoreController('api::order.order', ({ strapi }) => {
  const orders = strapi.service('api::order.order') as GenericService;
  const orderDays = strapi.service('api::order-day.order-day') as GenericService;
  const orderMeals = strapi.service('api::order-meal.order-meal') as GenericService;
  const orderBundles = strapi.service('api::order-bundle.order-bundle') as GenericService;
  const orderSnacks = strapi.service('api::order-snack.order-salad') as GenericService;
  const orderSalads = strapi.service('api::order-salad.order-salad') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const cartItemMeals = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
  const cartItemBundles = strapi.service('api::cart-item-bundle.cart-item-bundle') as GenericService;
  const cartItemSnacks = strapi.service('api::cart-item-snack.cart-item-snack') as GenericService;
  const cartItemSalads = strapi.service('api::cart-item-salad.cart-item-salad') as GenericService;

  async function placeOrder(ctx: API.Context) {
    type FindSubCartQuery = {
      results: API.Cart.CartDay[];
    };

    const order = await orders.create!({
      data: {
        user: ctx.state.user.id
      }
    });

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
        snacks: true,
        salads: {
          populate: {
            salad: true,
            omitted_ingredients: true
          }
        }
      }
    })) as FindSubCartQuery;

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
            user: ctx.state.user.id
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
                order_day: orderDay.id
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
                order_day: orderDay.id
              }
            });
            return dinnerOrder.id;
          })
        );
        const bundleOrders = await Promise.all(
          cart.bundles.map(async (bundle) => {
            console.log(bundle);

            const bundleOrder = await orderBundles.create!({
              data: {
                lunch: bundle?.lunch,
                dinner: bundle?.dinner,
                quantity: bundle?.quantity,
                //@ts-ignore
                lunch_protein_substitute: bundle?.lunch_protein_substitute,
                dinner_protein_substitute: bundle?.dinner_protein_substitute,
                lunch_accommodate_allergies: bundle?.lunch_accommodate_allergies,
                dinner_accommodate_allergies: bundle?.dinner_accommodate_allergies,
                lunch_omitted_ingredients: bundle?.lunch_omitted_ingredients,
                dinner_omitted_ingredients: bundle?.dinner_omitted_ingredients,
                bundle_snack: bundle?.bundle_snack,
                order: order.id
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
                order: order.id
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
                order: order.id
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
            user: ctx.state.user.id
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

    const updatedOrder = await orders.update!(order.id, {
      data: {
        monday: dayOrders.monday,
        tuesday: dayOrders.tuesday,
        wednesday: dayOrders.wednesday,
        thursday: dayOrders.thursday,
        friday: dayOrders.friday
      }
    });
  }

  return {
    async create(ctx: API.Context) {
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

      console.log(mealItems);
      //@ts-ignore
      const bundleLineItems = bundleItems.results.map((bundleItem) => {
        const lunchUnit = Math.round(bundleItem.lunch.price * 100);
        const dinnerUnit = Math.round(bundleItem.dinner.price * 100);

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bundleItem.lunch.title
            },
            unit_amount: lunchUnit + dinnerUnit
          },
          quantity: bundleItem.quantity
        };
      });
      const snackLineItems = snackItems.results.map((snackItem) => {
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
      //@ts-ignore
      const saladLineItems = saladItems.results.map((saladItem) => {
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

      const customer = await stripe.customers.retrieve(ctx.state.user.stripe_id);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customer.id,

        payment_method_types: ['card'],
        success_url: 'https://google.com',
        //@ts-ignore
        line_items: [
          //@ts-ignore
          ...mealItems.results.map((mealItem: any) => {
            // Example decimal unit amount
            const unit = Math.round(mealItem.meal.price * 100);
            console.log(unit);

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
          }),
          ...bundleLineItems
        ]
      });
      ctx.send({
        session,
        message: 'Order is being processed'
      });
      placeOrder(ctx);
    }
  };
});

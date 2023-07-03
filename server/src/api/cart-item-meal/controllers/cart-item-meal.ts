/**
 * cart-item-meal controller
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

//TODO Must validate whether the subcart to be modified is owned by the user making the request, Middleware?

export default factories.createCoreController('api::cart-item-meal.cart-item-meal', ({ strapi }) => {
  const mealItems = strapi.service('api::cart-item-meal.cart-item-meal') as GenericService;
  const meals = strapi.service('api::meal.meal') as GenericService;
  const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
  const carts = strapi.service('api::cart.cart') as GenericService;
  const environment = process.env.NODE_ENV;

  return {
    /*
    @desc Creates a new Cart-Item-Meal entry
    @route POST /api/cart-item-meals
    @access Private
    */
    async create(ctx: API.Context<API.Cart.CreateNewCartItemMealRequestBody>) {
      const cartDay = ctx.state.user.cartDay;

      if (!cartDay) {
        return ctx.badRequest('Day Cart must be appended to the state object');
      }
      try {
        const meal = await meals.findOne!(ctx.request.body.meal, {});

        if (!meal) {
          return ctx.badRequest('No meal exists with the provided ID');
        }
        const newMealItem: API.Cart.CartItemMeal = await mealItems.create!({
          data: {
            meal: ctx.request.body.meal,
            protein_substitute: ctx.request.body.protein_substitute,
            accommodate_allergies: ctx.request.body.accommodate_allergies,
            omitted_ingredients: ctx.request.body.omitted_ingredients,
            quantity: ctx.request.body.quantity,
            cart_day: cartDay.id,
            user: ctx.state.user.id,
            total: meal.price * ctx.request.body.quantity,
            day: cartDay.day
          }
        });

        let message;

        const day = cartDay.day[0].toUpperCase() + cartDay.day.slice(1);
        if (meal.type === 'dinner') {
          await cartDays.update!(cartDay.id, {
            data: {
              dinners: [...cartDay.dinners, newMealItem.id]
            }
          });

          const myCart = (await carts.find!({
            filters: {
              user: ctx.state.user.id
            }
          })) as API.Cart.CartQuery;

          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total + newMealItem.total
            }
          });

          message = `You have succesfully added a new dinner to your cart for ${day}`;
        } else if (meal.type === 'lunch') {
          await cartDays.update!(cartDay.id, {
            data: {
              lunches: [...cartDay.lunches, newMealItem.id]
            }
          });

          const myCart = (await carts.find!({
            filters: {
              user: ctx.state.user.id
            }
          })) as API.Cart.CartQuery;

          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total + newMealItem.total
            }
          });

          message = `You have succesfully added a new lunch to your cart for ${day}`;
        }
        const response = {
          message,
          ...(environment === 'development' && { meal_item: newMealItem })
        };
        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
    },

    /*
    @desc Updates a meal item in a users cart by incrementing the quantity of the meal item by 1
    @route PUT /api/cart-item-meals/:id
    @access Private
    @params id
    */
    async update(ctx: API.Context<null>) {
      const mealItem = ctx.state.mealItem;

      if (mealItem) {
        try {
          const updatedMeal = await mealItems.update!(mealItem.id, {
            data: {
              quantity: mealItem.quantity + 1,
              total: mealItem.meal.price * (mealItem.quantity + 1)
            }
          });
          const myCart = (await carts.find!({
            filters: {
              user: ctx.state.user.id
            }
          })) as API.Cart.CartQuery;
          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total + mealItem.meal.price
            }
          });

          const response = {
            message: 'Meal Item quantity incremented by 1',
            ...(environment === 'development' && { meal_item: updatedMeal })
          };

          return ctx.send(response);
        } catch (error) {
          if (error instanceof Error) {
            strapi.log.error(error.message);
            return ctx.badRequest(error.message, { error });
          }
        }
      }
    },
    /*
    @desc Deletes a meal item from the cart or decrements the quantity of the meal item by 1
    @route DELETE /api/cart-item-meals/:id
    @access Private
    @params id
    @query? {
      all: boolean
    }
    */

    async delete(ctx: API.Context<null, API.Cart.CartItemDeleteRequestQuery>) {
      const mealItem = ctx.state.mealItem;
      let message, updatedMealItem;

      try {
        const myCart = (await carts.find!({
          filters: {
            user: ctx.state.user.id
          }
        })) as API.Cart.CartQuery;

        const deleteAll = ctx.request.query.all;

        if (deleteAll === 'true' && mealItem) {
          await carts.update!(myCart.results[0].id, {
            data: {
              total: myCart.results[0].total - mealItem.total
            }
          });

          updatedMealItem = await mealItems.delete!(mealItem.id as never, {});

          message = 'Meal Item has been deleted';
        } else {
          if (mealItem && mealItem.quantity > 1) {
            updatedMealItem = await mealItems.update!(ctx.params.id, {
              data: {
                quantity: mealItem.quantity - 1,
                total: mealItem.meal.price * (mealItem.quantity - 1)
              }
            });

            message = 'Meal Item quantity decremented by 1';

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - mealItem.meal.price
              }
            });
          } else if (mealItem && mealItem.quantity === 1) {
            updatedMealItem = await mealItems.delete!(mealItem.id as never, {});

            await carts.update!(myCart.results[0].id, {
              data: {
                total: myCart.results[0].total - mealItem.meal.price
              }
            });

            message = 'Meal Item deleted from cart';
          }
        }

        const response = {
          message,
          ...(environment === 'development' && { meal_item: updatedMealItem })
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, { error });
        }
      }
    }
  };
});

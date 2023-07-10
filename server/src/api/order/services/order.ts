/**
 * order service
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreService('api::order.order');

export const extraServices = {
  async createOrder(ctx: API.Context) {
    const orders = strapi.service('api::order.order') as GenericService;
    const stagedCarts = strapi.service('api::staged-cart.staged-cart') as GenericService;
    const users = strapi.db.query('plugin::users-permissions.user');

    const user = (await users.findOne({
      where: {
        id: ctx.state.session!.metadata!.user_id
      }
    })) as API.Auth.User;

    if (!ctx.state.session || !ctx.state.session.metadata) {
      return ctx.badRequest('Session is not appended to the state object');
    }

    const stagedCart = (await stagedCarts.findOne!(
      ctx.state.session.metadata.staged_cart_id,
      {}
    )) as API.Cart.StagedCart;

    let lunchBreakdowns,
      dinnerBreakdowns,
      bundleBreakdowns,
      snackBreakdowns,
      saladBreakdowns,
      addOnBreakdowns,
      mondayBreakdowns,
      tuesdayBreakdowns,
      wednesdayBreakdowns,
      thursdayBreakdowns,
      fridayBreakdowns;

    stagedCart.cart.forEach((cart) => {
      lunchBreakdowns =
        cart.lunches.length > 0
          ? cart.lunches
              .map((lunch, i) => {
                const accommodateAllergies = lunch?.accommodate_allergies.map((allergy) => allergy.type);
                const omittedIngredients = lunch?.omitted_ingredients.map((ingredient) => ingredient.name);

                return `<div>
                ${i + 1}.
                  <div>Meal: ${lunch?.meal.title}</div>
                  <div>Quantity: ${lunch?.quantity}</div>
                  ${
                    lunch?.protein_substitute?.title
                      ? `<div>Protein Substitute: ${lunch?.protein_substitute?.title}</div>`
                      : '<div></div>'
                  }
                  ${
                    lunch?.accommodate_allergies.length > 0
                      ? `<div>Accommodate Allergies: ${accommodateAllergies}</div>`
                      : '<div></div>'
                  }
                  ${
                    lunch?.omitted_ingredients.length > 0
                      ? `<div>Omitted Ingredients: ${omittedIngredients}</div>`
                      : '<div></div>'
                  }
                </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      dinnerBreakdowns =
        cart.dinners.length > 0
          ? cart.dinners
              .map((dinner, i) => {
                const accommodateAllergies = dinner?.accommodate_allergies.map((allergy) => allergy.type);
                const omittedIngredients = dinner?.omitted_ingredients.map((ingredient) => ingredient.name);

                return `<div>
                ${i + 1}.
                  <div>Meal ${dinner?.meal.title}</div>
                  <div>Quantity: ${dinner?.quantity}</div>
                  ${
                    dinner?.protein_substitute?.title
                      ? `<div>Protein Substitute: ${dinner?.protein_substitute?.title}</div>`
                      : '<div></div>'
                  }
                  ${
                    dinner?.accommodate_allergies.length > 0
                      ? `<div>Accommodate Allergies: ${accommodateAllergies}</div>`
                      : '<div></div>'
                  }
                  ${
                    dinner?.omitted_ingredients.length > 0
                      ? `<div>Omitted Ingredients: ${omittedIngredients}</div>`
                      : '<div></div>'
                  }
                </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      bundleBreakdowns =
        cart.bundles.length > 0
          ? cart.bundles
              .map((bundle, i) => {
                const lunchAccommodateAllergies = bundle?.lunch_accommodate_allergies.map((allergy) => allergy.type);
                const dinnerAccommodateAllergies = bundle?.dinner_accommodate_allergies.map((allergy) => allergy.type);
                const lunchOmittedIngredients = bundle?.lunch_omitted_ingredients.map((ingredient) => ingredient.name);
                const dinnerOmittedIngredients = bundle?.dinner_omitted_ingredients.map(
                  (ingredient) => ingredient.name
                );

                return `<div>
                ${i + 1}.
                  <div>Lunch: ${bundle?.lunch?.title}</div>
                  <div>Dinner: ${bundle?.dinner?.title}</div> 
                  <div>Quantity: ${bundle?.quantity}</div>
                  ${
                    bundle?.lunch_protein_substitute?.title
                      ? `<div>Lunch Protein Substitute: ${bundle?.lunch_protein_substitute?.title}</div>`
                      : '<div></div>'
                  }
                  ${
                    bundle?.dinner_protein_substitute?.title
                      ? `<div>Dinner Protein Substitute: ${bundle?.dinner_protein_substitute?.title}</div>`
                      : '<div></div>'
                  }
                  ${
                    bundle?.lunch_accommodate_allergies.length > 0
                      ? `<div>Lunch Accommodate Allergies: ${lunchAccommodateAllergies}</div>`
                      : '<div></div>'
                  }
                  ${
                    bundle?.dinner_accommodate_allergies.length > 0
                      ? `<div>Dinner Accommodate Allergies: ${dinnerAccommodateAllergies}</div>`
                      : '<div></div>'
                  }
                  ${
                    bundle?.lunch_omitted_ingredients.length > 0
                      ? `<div>Lunch Omitted Ingredients: ${lunchOmittedIngredients}</div>`
                      : '<div></div>'
                  }
                  ${
                    bundle?.dinner_omitted_ingredients.length > 0
                      ? `<div>Dinner Omitted Ingredients: ${dinnerOmittedIngredients}</div>`
                      : '<div></div>'
                  }
                  ${bundle?.bundle_snack?.title ? `<div>Bundle Snack: ${bundle?.bundle_snack?.title}</div>` : ''}
                </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      snackBreakdowns =
        cart.snacks.length > 0
          ? cart.snacks
              .map((snack, i) => {
                return `<div>
                ${i + 1}.
                  <div>Snack: ${snack?.snack?.title}</div>
                  <div>Quantity: ${snack?.quantity}</div>
                </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      saladBreakdowns =
        cart.salads.length > 0
          ? cart.salads
              .map((salad, i) => {
                const omittedIngredients = salad?.omitted_ingredients.map((ingredient) => ingredient.name);

                return `<div>
                ${i + 1}.
                  <div>Salad: ${salad?.salad?.title}</div>
                  <div>Quantity: ${salad?.quantity}</div>
                  ${
                    salad?.omitted_ingredients.length > 0
                      ? `<div>Omitted Ingredients: ${omittedIngredients}</div>`
                      : '<div></div>'
                  }
                </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      addOnBreakdowns =
        cart.add_ons.length > 0
          ? cart.add_ons
              .map((addOn, i) => {
                return `<div>
                    ${i + 1}.
                      <div>Add On: ${addOn?.add_on?.title}</div>
                      <div>Quantity: ${addOn?.quantity}</div>
                    </div><br/><br/>`;
              })
              .join('')
          : `<div></div>`;

      if (cart.day === 'monday') {
        mondayBreakdowns = `<div><h2>Monday</h2>${
          lunchBreakdowns !== '<div></div>' ? `<h3>Lunches:</h3> ${lunchBreakdowns}` : '<div></div>'
        }${dinnerBreakdowns !== '<div></div>' ? `<h3>Dinners:</h3> ${dinnerBreakdowns}` : '<div></div>'}${
          bundleBreakdowns !== '<div></div>' ? `<h3>Bundles:</h3> ${bundleBreakdowns}` : '<div></div>'
        }${snackBreakdowns !== '<div></div>' ? `<h3>Snacks:</h3> ${snackBreakdowns}` : '<div></div>'}${
          saladBreakdowns !== '<div></div>' ? `<h3>Salads:</h3> ${saladBreakdowns}` : '<div></div>'
        }${addOnBreakdowns !== '<div></div>' ? `<h3>Add Ons:</h3> ${addOnBreakdowns}` : '<div></div>'}</div>`;
      }
      if (cart.day === 'tuesday') {
        tuesdayBreakdowns = `<div><h2>Tuesday</h2>${
          lunchBreakdowns !== '<div></div>' ? `<h3>Lunches:</h3> ${lunchBreakdowns}` : '<div></div>'
        }${dinnerBreakdowns !== '<div></div>' ? `<h3>Dinners:</h3> ${dinnerBreakdowns}` : '<div></div>'}${
          bundleBreakdowns !== '<div></div>' ? `<h3>Bundles:</h3> ${bundleBreakdowns}` : '<div></div>'
        }${snackBreakdowns !== '<div></div>' ? `<h3>Snacks:</h3> ${snackBreakdowns}` : '<div></div>'}${
          saladBreakdowns !== '<div></div>' ? `<h3>Salads:</h3> ${saladBreakdowns}` : '<div></div>'
        }${addOnBreakdowns !== '<div></div>' ? `<h3>Add Ons:</h3> ${addOnBreakdowns}` : '<div></div>'}</div>`;
      }
      if (cart.day === 'wednesday') {
        wednesdayBreakdowns = `<div><h2>Wednesday</h2>${
          lunchBreakdowns !== '<div></div>' ? `<h3>Lunches:</h3> ${lunchBreakdowns}` : '<div></div>'
        }${dinnerBreakdowns !== '<div></div>' ? `<h3>Dinners:</h3> ${dinnerBreakdowns}` : '<div></div>'}${
          bundleBreakdowns !== '<div></div>' ? `<h3>Bundles:</h3> ${bundleBreakdowns}` : '<div></div>'
        }${snackBreakdowns !== '<div></div>' ? `<h3>Snacks:</h3> ${snackBreakdowns}` : '<div></div>'}${
          saladBreakdowns !== '<div></div>' ? `<h3>Salads:</h3> ${saladBreakdowns}` : '<div></div>'
        }${addOnBreakdowns !== '<div></div>' ? `<h3>Add Ons:</h3> ${addOnBreakdowns}` : '<div></div>'}</div>`;
      }
      if (cart.day === 'thursday') {
        thursdayBreakdowns = `<div><h2>Thursday</h2>${
          lunchBreakdowns !== '<div></div>' ? `<h3>Lunches:</h3> ${lunchBreakdowns}` : '<div></div>'
        }${dinnerBreakdowns !== '<div></div>' ? `<h3>Dinners:</h3> ${dinnerBreakdowns}` : '<div></div>'}${
          bundleBreakdowns !== '<div></div>' ? `<h3>Bundles:</h3> ${bundleBreakdowns}` : '<div></div>'
        }${snackBreakdowns !== '<div></div>' ? `<h3>Snacks:</h3> ${snackBreakdowns}` : '<div></div>'}${
          saladBreakdowns !== '<div></div>' ? `<h3>Salads:</h3> ${saladBreakdowns}` : '<div></div>'
        }${addOnBreakdowns !== '<div></div>' ? `<h3>Add Ons:</h3> ${addOnBreakdowns}` : '<div></div>'}</div>`;
      }
      if (cart.day === 'friday') {
        fridayBreakdowns = `<div><h2>Friday</h2>${
          lunchBreakdowns !== '<div></div>' ? `<h3>Lunches:</h3> ${lunchBreakdowns}` : '<div></div>'
        }${dinnerBreakdowns !== '<div></div>' ? `<h3>Dinners:</h3> ${dinnerBreakdowns}` : '<div></div>'}${
          bundleBreakdowns !== '<div></div>' ? `<h3>Bundles:</h3> ${bundleBreakdowns}` : '<div></div>'
        }${snackBreakdowns !== '<div></div>' ? `<h3>Snacks:</h3> ${snackBreakdowns}` : '<div></div>'}${
          saladBreakdowns !== '<div></div>' ? `<h3>Salads:</h3> ${saladBreakdowns}` : '<div></div>'
        }${addOnBreakdowns !== '<div></div>' ? `<h3>Add Ons:</h3> ${addOnBreakdowns}` : '<div></div>'}</div>`;
      }
    });
    const orderSheet = `<div>
        <h2>Order Breakdown for ${ctx.state.session.metadata.user_email}</h2>
        <p>${user.first_name} ${user.last_name}<br>${user.street}<br>${user.city}<br>${user.state}<br>${
      user.zipcode
    }</p>
        <div>
        ${mondayBreakdowns ? mondayBreakdowns : '<div></div>'}
        ${tuesdayBreakdowns ? tuesdayBreakdowns : '<div></div>'}
        ${wednesdayBreakdowns ? wednesdayBreakdowns : '<div></div>'}
        ${thursdayBreakdowns ? thursdayBreakdowns : '<div></div>'}
        ${fridayBreakdowns ? fridayBreakdowns : '<div></div>'}
        </div>
        </div>`;

    await orders.create!({
      data: {
        order: orderSheet,
        user: ctx.state.session.metadata.user_id,
        total: ctx.state.session.amount_total ? ctx.state.session.amount_total / 100 : 0,
        stripe_session_id: ctx.state.session.id
      }
    });
  },

  async updateStagedCart(ctx: API.Context, stagedCartId: string) {
    const cartDays = strapi.service('api::cart-day.cart-day') as GenericService;
    const stagedCarts = strapi.service('api::staged-cart.staged-cart') as GenericService;

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
        }
      }
    })) as API.Cart.CartDayQuery;

    await stagedCarts.update!(stagedCartId, {
      data: {
        cart: subCarts
      }
    });
  },
  async postOrderCleanup(ctx: API.Context) {
    const stagedCarts = strapi.service('api::staged-cart.staged-cart') as GenericService;

    if (!ctx.state.session || !ctx.state.session.metadata) {
      return ctx.badRequest('Session is not appended to the state object');
    }

    await stagedCarts.delete!(ctx.state.session.metadata.staged_cart_id as never, {});

    const toDeleteCartItemMeals = await strapi.db
      .query('api::cart-item-meal.cart-item-meal')
      .findMany({ where: { user: ctx.state.session.metadata.user_id } });
    await strapi.db
      .query('api::cart-item-meal.cart-item-meal')
      .deleteMany({ where: { id: { $in: toDeleteCartItemMeals.map(({ id }) => id) } } });

    const toDeleteCartItemBundles = await strapi.db
      .query('api::cart-item-bundle.cart-item-bundle')
      .findMany({ where: { user: ctx.state.session.metadata.user_id } });
    await strapi.db
      .query('api::cart-item-bundle.cart-item-bundle')
      .deleteMany({ where: { id: { $in: toDeleteCartItemBundles.map(({ id }) => id) } } });

    const toDeleteCartItemSnack = await strapi.db
      .query('api::cart-item-snack.cart-item-snack')
      .findMany({ where: { user: ctx.state.session.metadata.user_id } });
    await strapi.db
      .query('api::cart-item-snack.cart-item-snack')
      .deleteMany({ where: { id: { $in: toDeleteCartItemSnack.map(({ id }) => id) } } });

    const toDeleteCartItemSalad = await strapi.db
      .query('api::cart-item-salad.cart-item-salad')
      .findMany({ where: { user: ctx.state.session.metadata.user_id } });
    await strapi.db
      .query('api::cart-item-salad.cart-item-salad')
      .deleteMany({ where: { id: { $in: toDeleteCartItemSalad.map(({ id }) => id) } } });

    const toDeleteCartItemAddOn = await strapi.db
      .query('api::cart-item-add-on.cart-item-add-on')
      .findMany({ where: { user: ctx.state.session.metadata.user_id } });
    await strapi.db
      .query('api::cart-item-add-on.cart-item-add-on')
      .deleteMany({ where: { id: { $in: toDeleteCartItemAddOn.map(({ id }) => id) } } });

    await strapi.db.query('api::cart.cart').update({
      where: { user: ctx.state.session.metadata.user_id },
      data: {
        total: 0
      }
    });
  }
};

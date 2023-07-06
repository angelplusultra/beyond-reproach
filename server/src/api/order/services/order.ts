/**
 * order service
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreService('api::order.order');

export const extraServices = {
  async createOrder(ctx: API.Context) {
    // TODO FIGURE OUT IF THE CLIENT WANTS THE MORE SIMPLIFIED VERSION THE USER RECEIVES OR THE TABLE BREAKDOWN
    // TODO   ADD TRY/CATCH AND REFINE RESPONSE
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

    // stagedCart.cart.forEach((cart) => {
    //   const lunchOrderEntries =
    //     cart.lunches.length > 0
    //       ? cart.dinners
    //           .map((dinner) => {
    //             const accommodateAllergies =
    //               dinner?.accommodate_allergies.map((allergy) => allergy.type).length > 0
    //                 ? dinner?.accommodate_allergies.map((allergy) => allergy.type)
    //                 : 'None';
    //             const omittedIngredients =
    //               dinner?.omitted_ingredients.map((ingredient) => ingredient.name).length > 0
    //                 ? dinner?.omitted_ingredients.map((ingredient) => ingredient.name)
    //                 : 'None';

    //             return `<tr>
    //         <td>${dinner?.meal.title}</td>
    //         <td>${dinner?.quantity}</td>
    //         <td>${dinner?.protein_substitute?.title || 'None'}</td>
    //         <td>${accommodateAllergies}</td>
    //         <td>${omittedIngredients}</td>
    //         </tr>`;
    //           })
    //           .join('')
    //       : `<div></div>`;

    //   const lunchOrders = `<table>
    //     <thead>
    //       <tr>
    //         <th>Meal</th>
    //         <th>Quantity</th>
    //         <th>Protein Substitute</th>
    //         <th>Accommodate Allergies</th>
    //         <th>Omitted Ingredients</th>
    //         </tr>
    //         </thead>
    //         <tbody>
    //         ${lunchOrderEntries}
    //         </tbody>
    //         </table>`;

    //   const dinnerOrderEntries =
    //     cart.dinners.length > 0
    //       ? cart.dinners
    //           .map((dinner) => {
    //             const accommodateAllergies =
    //               dinner?.accommodate_allergies.map((allergy) => allergy.type).length > 0
    //                 ? dinner?.accommodate_allergies.map((allergy) => allergy.type)
    //                 : 'None';
    //             const omittedIngredients =
    //               dinner?.omitted_ingredients.map((ingredient) => ingredient.name).length > 0
    //                 ? dinner?.omitted_ingredients.map((ingredient) => ingredient.name)
    //                 : 'None';

    //             return `<tr>
    //         <td  style="border: 1px solid #000000;">${dinner?.meal.title}</td>
    //         <td>${dinner?.quantity}</td>
    //         <td>${dinner?.protein_substitute?.title || 'None'}</td>
    //         <td>${accommodateAllergies}</td>
    //         <td>${omittedIngredients}</td>
    //         </tr>`;
    //           })
    //           .join('')
    //       : `<div></div>`;

    //   const dinnerOrders = `<table>
    //     <thead>
    //       <tr>
    //         <th>Meal</th>
    //         <th>Quantity</th>
    //         <th>Protein Substitute</th>
    //         <th>Accommodate Allergies</th>
    //         <th>Omitted Ingredients</th>
    //         </tr>
    //         </thead>
    //         <tbody>
    //         ${dinnerOrderEntries}
    //         </tbody>
    //         </table>`;

    //   const bundleOrderEntries =
    //     cart.bundles.length > 0
    //       ? cart.bundles
    //           .map((bundle) => {
    //             const lunchAccommodateAllergies =
    //               bundle?.lunch_accommodate_allergies.map((allergy) => allergy.type).length > 0
    //                 ? bundle?.lunch_accommodate_allergies.map((allergy) => allergy.type)
    //                 : 'None';
    //             const dinnerAccommodateAllergies =
    //               bundle?.dinner_accommodate_allergies.map((allergy) => allergy.type).length > 0
    //                 ? bundle?.dinner_accommodate_allergies.map((allergy) => allergy.type)
    //                 : 'None';
    //             const lunchOmittedIngredients =
    //               bundle?.lunch_omitted_ingredients.map((ingredient) => ingredient.name).length > 0
    //                 ? bundle?.lunch_omitted_ingredients.map((ingredient) => ingredient.name)
    //                 : 'None';
    //             const dinnerOmittedIngredients =
    //               bundle?.dinner_omitted_ingredients.map((ingredient) => ingredient.name).length > 0
    //                 ? bundle?.dinner_omitted_ingredients.map((ingredient) => ingredient.name)
    //                 : 'None';

    //             return `<tr>
    //         <td>${bundle?.lunch?.title}</td>
    //         <td>${bundle?.dinner?.title}</td>
    //         <td>${bundle?.quantity}</td>
    //         <td>${bundle?.lunch_protein_substitute?.title || 'None'}</td>
    //         <td>${bundle?.dinner_protein_substitute?.title || 'None'}</td>
    //         <td>${lunchAccommodateAllergies}</td>
    //         <td>${dinnerAccommodateAllergies}</td>
    //         <td>${lunchOmittedIngredients}</td>
    //         <td>${dinnerOmittedIngredients}</td>
    //         <td>${bundle?.bundle_snack?.title || 'None'}</td>
    //         </tr>`;
    //           })
    //           .join('')
    //       : `<div></div>`;

    //   const bundleOrders = `<table>
    //     <thead>
    //       <tr>
    //         <th>Lunch</th>
    //         <th>Dinner</th>
    //         <th>Quantity</th>
    //         <th>Lunch Protein Substitute</th>
    //         <th>Dinner Protein Substitute</th>
    //         <th>Lunch Accommodate Allergies</th>
    //         <th>Dinner Accommodate Allergies</th>
    //         <th>Lunch Omitted Ingredients</th>
    //         <th>Dinner Omitted Ingredients</th>
    //         <th>Bundle Snack</th>
    //         </tr>
    //         </thead>
    //         <tbody>
    //         ${bundleOrderEntries}
    //         </tbody>
    //         </table>`;
    //   const snackOrderEntries =
    //     cart.snacks.length > 0
    //       ? cart.snacks
    //           .map((snack) => {
    //             return `<tr><td>${snack?.snack?.title}</td><td>${snack?.quantity}</td></tr>`;
    //           })
    //           .join('')
    //       : `<div></div>`;

    //   const snackOrders = `<table>
    //     <thead>
    //       <tr>
    //         <th>Snack</th>
    //         <th>Quantity</th>
    //         </tr>
    //         </thead>
    //         <tbody>
    //         ${snackOrderEntries}
    //         </tbody>
    //         </table>`;

    //   const saladOrderEntries =
    //     cart.salads.length > 0
    //       ? cart.salads
    //           .map((salad) => {
    //             const omittedIngredients =
    //               salad?.omitted_ingredients.map((ingredient) => ingredient.name).length > 0
    //                 ? salad?.omitted_ingredients.map((ingredient) => ingredient.name)
    //                 : 'None';
    //             return `<tr>
    //         <td>${salad?.salad?.title}</td>
    //         <td>${salad?.quantity}</td>
    //         <td>${omittedIngredients}</td>
    //         </tr>`;
    //           })
    //           .join('')
    //       : `<div></div>`;
    //   const saladOrders = `<table><thead>
    //       <tr>
    //         <th>Salad</th>
    //         <th>Quantity</th>
    //         <th>Omitted Ingredients</th>
    //         </tr>
    //         </thead>
    //         <tbody>
    //         ${saladOrderEntries}
    //         </tbody>
    //         </table>`;

    //   if (cart.day === 'monday') {
    //     mondayOrders = `<h2 style="text-align: center;">Monday</h2>
    //     <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
    //       dinnerOrders || 'None'
    //     }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
    //       snackOrders || 'None'
    //     }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
    //   }

    //   if (cart.day === 'tuesday') {
    //     tuesdayOrders = `<h2 style="text-align: center;">Tuesday</h2>
    //     <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
    //       dinnerOrders || 'None'
    //     }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
    //       snackOrders || 'None'
    //     }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
    //   }

    //   if (cart.day === 'wednesday') {
    //     wednesdayOrders = `<h2 style="text-align: center;">Wednesday</h2>
    //     <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
    //       dinnerOrders || 'None'
    //     }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
    //       snackOrders || 'None'
    //     }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
    //   }

    //   if (cart.day === 'thursday') {
    //     thursdayOrders = `<h2 style="text-align: center;">Thursday</h2>
    //     <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
    //       dinnerOrders || 'None'
    //     }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
    //       snackOrders || 'None'
    //     }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
    //   }

    //   if (cart.day === 'friday') {
    //     fridayOrders = `<h2 style="text-align: center;">Friday</h2>
    //     <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
    //       dinnerOrders || 'None'
    //     }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
    //       snackOrders || 'None'
    //     }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
    //   }
    // });

    // const orderSheet = `<h1>Order for ${ctx.state.session.metadata.user_email}</h1>
    // <div>
    // ${mondayOrders}
    // ${tuesdayOrders}
    // ${wednesdayOrders}
    // ${thursdayOrders}
    // ${fridayOrders}
    // </div>`;

    let lunchBreakdowns,
      dinnerBreakdowns,
      bundleBreakdowns,
      snackBreakdowns,
      saladBreakdowns,
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
                    lunch?.omitted_ingredients.length > 0 ? `<div>Omitted Ingredients: ${omittedIngredients}</div>` : ''
                  }
                </div><br/><br/>`;
              })
              .join('')
          : ``;

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
          : ``;

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
          : ``;

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
          : ``;

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
          : ``;

      if (cart.day === 'monday') {
        mondayBreakdowns = `<div><h2>Monday</h2>${lunchBreakdowns && `<h3>Lunches:</h3> ${lunchBreakdowns}`}${
          dinnerBreakdowns && `<h3>Dinners:</h3> ${dinnerBreakdowns}`
        }${bundleBreakdowns && `<h3>Bundles:</h3> ${bundleBreakdowns}`}${
          snackBreakdowns && `<h3>Snacks:</h3> ${snackBreakdowns}`
        }${saladBreakdowns && `<h3>Salads:</h3> ${saladBreakdowns}`}</div>`;
      }
      if (cart.day === 'tuesday') {
        tuesdayBreakdowns = `<div><h2>Tuesday</h2>${lunchBreakdowns && `<h3>Lunches:</h3> ${lunchBreakdowns}`}${
          dinnerBreakdowns && `<h3>Dinners:</h3> ${dinnerBreakdowns}`
        }${bundleBreakdowns && `<h3>Bundles:</h3> ${bundleBreakdowns}`}${
          snackBreakdowns && `<h3>Snacks:</h3> ${snackBreakdowns}`
        }${saladBreakdowns && `<h3>Salads:</h3> ${saladBreakdowns}`}</div>`;
      }
      if (cart.day === 'wednesday') {
        wednesdayBreakdowns = `<div><h2>Wednesday</h2>${lunchBreakdowns && `<h3>Lunches:</h3> ${lunchBreakdowns}`}${
          dinnerBreakdowns && `<h3>Dinners:</h3> ${dinnerBreakdowns}`
        }${bundleBreakdowns && `<h3>Bundles:</h3> ${bundleBreakdowns}`}${
          snackBreakdowns && `<h3>Snacks:</h3> ${snackBreakdowns}`
        }${saladBreakdowns && `<h3>Salads:</h3> ${saladBreakdowns}`}</div>`;
      }
      if (cart.day === 'thursday') {
        thursdayBreakdowns = `<div><h2>Thursday</h2>${lunchBreakdowns && `<h3>Lunches:</h3> ${lunchBreakdowns}`}${
          dinnerBreakdowns && `<h3>Dinners:</h3> ${dinnerBreakdowns}`
        }${bundleBreakdowns && `<h3>Bundles:</h3> ${bundleBreakdowns}`}${
          snackBreakdowns && `<h3>Snacks:</h3> ${snackBreakdowns}`
        }${saladBreakdowns && `<h3>Salads:</h3> ${saladBreakdowns}`}</div>`;
      }
      if (cart.day === 'friday') {
        fridayBreakdowns = `<div><h2>Friday</h2>${lunchBreakdowns && `<h3>Lunches:</h3> ${lunchBreakdowns}`}${
          dinnerBreakdowns && `<h3>Dinners:</h3> ${dinnerBreakdowns}`
        }${bundleBreakdowns && `<h3>Bundles:</h3> ${bundleBreakdowns}`}${
          snackBreakdowns && `<h3>Snacks:</h3> ${snackBreakdowns}`
        }${saladBreakdowns && `<h3>Salads:</h3> ${saladBreakdowns}`}</div>`;
      }
    });
    const orderSheetV2 = `<div>
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
        order: orderSheetV2,
        user: ctx.state.session.metadata.user_id,
        total: ctx.state.session.amount_total ? ctx.state.session.amount_total / 100 : 0,
        stripe_session_id: ctx.state.session.id
      }
    });

    process.env.DEVELOPMENT_TEST_EMAIL &&
      (await strapi.plugins['email'].services.email.send({
        to: process.env.DEVELOPMENT_TEST_EMAIL,
        subject: 'Test Email',
        text: 'Hello world!',
        html: orderSheetV2
      }));
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
    // TODO ADD TRY/CATCH AND REFINE RESPONSE
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

    await strapi.db.query('api::cart.cart').update({
      where: { user: ctx.state.session.metadata.user_id },
      data: {
        total: 0
      }
    });
  }
};

/**
 * order service
 */

import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

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

    if (!ctx.state.session || !ctx.state.session.metadata) {
      return ctx.badRequest('Session is not appended to the state object');
    }
    const user: API.Auth.User = await users.findOne!({
      where: {
        id: ctx.state.session.metadata.user_id
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

    const days = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: ''
    };

    // await Promise.all(
    //   subCarts.results.map(async (cart) => {
    //     const orderDay = await orderDays.create!({
    //       data: {
    //         user: user.id
    //       }
    //     });

    //     const lunchOrders = await Promise.all(
    //       cart.lunches.map(async (lunch) => {
    //         const lunchOrder = await orderMeals.create!({
    //           data: {
    //             meal: lunch?.meal.id,
    //             quantity: lunch?.quantity,
    //             accommodate_allergies: lunch.accommodate_allergies,
    //             protein_substitute: lunch?.protein_substitute.id,
    //             omitted_ingredients: lunch?.omitted_ingredients,
    //             order: order.id,
    //             order_day: orderDay.id,
    //             user: user.id
    //           }
    //         });
    //         return lunchOrder.id;
    //       })
    //     );
    //     const dinnerOrders = await Promise.all(
    //       cart.dinners.map(async (dinner) => {
    //         const dinnerOrder = await orderMeals.create!({
    //           data: {
    //             meal: dinner?.meal,
    //             quantity: dinner?.quantity,
    //             accommodate_allergies: dinner?.accommodate_allergies,
    //             protein_substitute: dinner?.protein_substitute,
    //             omitted_ingredients: dinner?.omitted_ingredients,
    //             order: order.id,
    //             order_day: orderDay.id,
    //             user: user.id
    //           }
    //         });
    //         return dinnerOrder.id;
    //       })
    //     );
    //     const bundleOrders = await Promise.all(
    //       cart.bundles.map(async (bundle) => {
    //         const bundleOrder = await orderBundles.create!({
    //           data: {
    //             lunch: bundle?.lunch,
    //             dinner: bundle?.dinner,
    //             quantity: bundle?.quantity,
    //             lunch_protein_substitute: bundle?.lunch_protein_substitute,
    //             dinner_protein_substitute: bundle?.dinner_protein_substitute,
    //             lunch_accommodate_allergies: bundle?.lunch_accommodate_allergies,
    //             dinner_accommodate_allergies: bundle?.dinner_accommodate_allergies,
    //             lunch_omitted_ingredients: bundle?.lunch_omitted_ingredients,
    //             dinner_omitted_ingredients: bundle?.dinner_omitted_ingredients,
    //             bundle_snack: bundle?.bundle_snack,
    //             order: order.id,
    //             order_day: orderDay.id,
    //             user: user.id
    //           }
    //         });
    //         return bundleOrder.id;
    //       })
    //     );

    //     const snackOrders = await Promise.all(
    //       cart.snacks.map(async (snack) => {
    //         const snackOrder = await orderSnacks.create!({
    //           data: {
    //             snack: snack?.snack,
    //             quantity: snack?.quantity,
    //             order: order.id,
    //             order_day: orderDay.id,
    //             user: user.id
    //           }
    //         });
    //         return snackOrder.id;
    //       })
    //     );

    //     const saladOrders = await Promise.all(
    //       cart.salads.map(async (salad) => {
    //         const saladOrder = await orderSalads.create!({
    //           data: {
    //             salad: salad?.salad,
    //             quantity: salad?.quantity,
    //             omitted_ingredients: salad?.omitted_ingredients,
    //             order: order.id,
    //             user: user.id,
    //             order_day: orderDay.id
    //           }
    //         });
    //         return saladOrder.id;
    //       })
    //     );

    //     await orderDays.update!(orderDay.id, {
    //       data: {
    //         lunches: lunchOrders,
    //         dinners: dinnerOrders,
    //         bundles: bundleOrders,
    //         snacks: snackOrders,
    //         salads: saladOrders,
    //         order: order.id,
    //         user: user.id
    //       }
    //     });

    //     days[cart.day] = orderDay.id;
    //   })
    // );
    // // why aree they remaining as empty strings?

    // const dayOrders = {
    //   monday: days.monday,
    //   tuesday: days.tuesday,
    //   wednesday: days.wednesday,
    //   thursday: days.thursday,
    //   friday: days.friday
    // };

    // await orders.update!(order.id, {
    //   data: {
    //     monday: dayOrders.monday,
    //     tuesday: dayOrders.tuesday,
    //     wednesday: dayOrders.wednesday,
    //     thursday: dayOrders.thursday,
    //     friday: dayOrders.friday
    //   }
    // });

    let mondayOrders = '';
    let tuesdayOrders = '';
    let wednesdayOrders = '';
    let thursdayOrders = '';
    let fridayOrders = '';

    console.log(subCarts.results);

    subCarts.results.forEach((cart) => {
      let lunchOrders = '';
      let dinnerOrders = '';
      let bundleOrders = '';
      let saladOrders = '';
      let snackOrders = '';

      cart.lunches.forEach((lunch) => {
        // Append tables to string for each lunch item and attributes, USING MARKDOWN SYNTAX

        lunchOrders += `<table>
        <thead>
          <tr>
            <th>Meal</th>
            <th>Quantity</th>
            <th>Protein Substitute</th>
            <th>Accommodate Allergies</th>
            <th>Omitted Ingredients</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${lunch?.meal.id}</td>
            <td>${lunch?.quantity}</td>
            <td>${lunch?.protein_substitute?.title}</td>
            <td>${lunch?.accommodate_allergies.map((allergy) => allergy.type)}</td>
            <td>${lunch?.omitted_ingredients.map((ingredient) => ingredient.name)}</td>
            </tr>
            </tbody>
            </table>
            `;
      });

      cart.dinners.forEach((dinner) => {
        // Append tables to string for each dinner item and attributes
        const omittedIngredients =
          dinner?.omitted_ingredients.map((ingredient) => ingredient.name).length > 0
            ? dinner?.omitted_ingredients.map((ingredient) => ingredient.name)
            : 'None';
        dinnerOrders += `<table>
        <thead>
          <tr>
            <th>Meal</th>
            <th>Quantity</th>
            <th>Protein Substitute</th>
            <th>Accommodate Allergies</th>
            <th>Omitted Ingredients</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${dinner?.meal.title}</td>
            <td>${dinner?.quantity}</td>
            <td>${dinner?.protein_substitute?.title || 'None'}</td>
            <td>${dinner?.accommodate_allergies.map((allergy) => allergy.type)}</td>
            <td>${omittedIngredients}</td>
            </tr>
            </tbody>
            </table>`;
      });

      cart.bundles.forEach((bundle) => {
        // Append tables to string for each bundle item and attributes
        const lunchAccommodateAllergies =
          bundle?.lunch_accommodate_allergies.map((allergy) => allergy.type).length > 0
            ? bundle?.lunch_accommodate_allergies.map((allergy) => allergy.type)
            : 'None';

        const dinnerAccommodateAllergies =
          bundle?.dinner_accommodate_allergies.map((allergy) => allergy.type).length > 0
            ? bundle?.dinner_accommodate_allergies.map((allergy) => allergy.type)
            : 'None';

        const lunchOmittedIngredients =
          bundle?.lunch_omitted_ingredients.map((ingredient) => ingredient.name).length > 0
            ? bundle?.lunch_omitted_ingredients.map((ingredient) => ingredient.name)
            : 'None';

        const dinnerOmittedIngredients =
          bundle?.dinner_omitted_ingredients.map((ingredient) => ingredient.name).length > 0
            ? bundle?.dinner_omitted_ingredients.map((ingredient) => ingredient.name)
            : 'None';

        bundleOrders += `<table><thead>
          <tr>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Quantity</th>
            <th>Lunch Protein Substitute</th>
            <th>Dinner Protein Substitute</th>
            <th>Lunch Accommodate Allergies</th>
            <th>Dinner Accommodate Allergies</th>
            <th>Lunch Omitted Ingredients</th>
            <th>Dinner Omitted Ingredients</th>
            <th>Bundle Snack</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${bundle?.lunch.title}</td>
            <td>${bundle?.dinner.title}</td>
            <td>${bundle?.quantity}</td>
            <td>${bundle?.lunch_protein_substitute?.title || 'None'}</td>
            <td>${bundle?.dinner_protein_substitute?.title || 'None'}</td>
            <td>${lunchAccommodateAllergies}</td>
            <td>${dinnerAccommodateAllergies}</td>
            <td>${lunchOmittedIngredients}</td>
            <td>${dinnerOmittedIngredients}</td>
            <td>${bundle.bundle_snack.title}</td>
            </tr>
            </tbody>
            </table>`;
      });

      cart.salads.forEach((salad) => {
        const omittedIngredients =
          salad?.omitted_ingredients.map((ingredient) => ingredient.name).length > 0
            ? salad?.omitted_ingredients.map((ingredient) => ingredient.name)
            : 'None';

        saladOrders += `<table>
        <thead>
          <tr>
            <th>Salad</th>
            <th>Quantity</th>
            <th>Omitted Ingredients</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${salad?.salad.title}</td>
            <td>${salad?.quantity}</td>
            <td>${omittedIngredients}</td>
            </tr>
            </tbody>
            </table>
            `;
      });

      cart.snacks.forEach((snack) => {
        snackOrders += `<table>
        <thead>
          <tr>
            <th>Snack</th>
            <th>Quantity</th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>${snack?.snack?.title}</td>
            <td>${snack?.quantity}</td>
            </tr>
            </tbody>
            </table>
            `;
      });

      if (cart.day === 'monday') {
        mondayOrders = `<h2 style="text-align: center;">Monday</h2>
        <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
          dinnerOrders || 'None'
        }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
          snackOrders || 'None'
        }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
      }
      if (cart.day === 'tuesday') {
        tuesdayOrders = `<h2 style="text-align: center;">Tuesday</h2>
        <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
          dinnerOrders || 'None'
        }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
          snackOrders || 'None'
        }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
      }
      if (cart.day === 'wednesday') {
        wednesdayOrders = `<h2 style="text-align: center;">Wednesday</h2>
        <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
          dinnerOrders || 'None'
        }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
          snackOrders || 'None'
        }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
      }

      if (cart.day === 'thursday') {
        thursdayOrders = `<h2 style="text-align: center;">Thursday</h2>
        <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
          dinnerOrders || 'None'
        }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
          snackOrders || 'None'
        }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
      }

      if (cart.day === 'friday') {
        fridayOrders = `<h2 style="text-align: center;">Friday</h2>
        <h3>Lunches:</h3> ${lunchOrders || 'None'}<br><br><h3>Dinners:</h3> ${
          dinnerOrders || 'None'
        }<br><br><h3>Bundles:</h3> ${bundleOrders || 'None'}<br><br><h3>Snacks:</h3> ${
          snackOrders || 'None'
        }<br><br><h3>Salads:</h3> ${saladOrders || 'None'}<br><br>`;
      }
    });

    await orders.update!(order.id, {
      data: {
        text: `<h1>Order for ${user.email}</h1>
        ${mondayOrders}
        ${tuesdayOrders}
        ${wednesdayOrders}
        ${thursdayOrders}
        ${fridayOrders}
        `
      }
    });
  }
};

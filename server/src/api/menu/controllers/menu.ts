import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::menu.menu', ({ strapi }) => {
  return {
    async find(ctx: API.Context) {
      const menus = strapi.service('api::menu.menu') as GenericService;
      const currentDate = new Date();
      const currentDateTimeString = currentDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
      const currentDateTime = new Date(currentDateTimeString);

      function getCurrentMenu(allMenus: API.ContentType.MenuQuery) {
        return allMenus.results
          .filter((menu) => new Date(menu.release_date) <= currentDateTime)
          .sort((a, b) => {
            const dateA = new Date(a.release_date);
            const dateB = new Date(b.release_date);
            return +dateB - +dateA;
          })[0];
      }
      try {
        const allMenus = (await menus.find!({
          populate: {
            monday_lunch: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            monday_dinner: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            tuesday_lunch: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            tuesday_dinner: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            wednesday_lunch: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            wednesday_dinner: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            thursday_lunch: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            thursday_dinner: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            friday_lunch: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            friday_dinner: {
              populate: {
                allergies: true,
                accommodated_allergies: true,
                omittable_ingredients: true,
                protein_substitutes: true
              }
            },
            snack_01: true,
            snack_02: true,
            salad_01: {
              populate: {
                omittable_ingredients: true
              }
            },
            salad_02: {
              populate: {
                omittable_ingredients: true
              }
            }
          }
        })) as API.ContentType.MenuQuery;

        const currentMenu = getCurrentMenu(allMenus); // Call getCurrentMenu

        const response = {
          message: 'Menu retrieved successfully',
          menu: currentMenu
        };

        return ctx.send(response);
      } catch (error) {
        if (error instanceof Error) {
          strapi.log.error(error.message);
          return ctx.badRequest(error.message, {
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          });
        }
      }
    }
  };
});

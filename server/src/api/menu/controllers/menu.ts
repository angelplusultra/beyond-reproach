import { factories } from '@strapi/strapi';
import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default factories.createCoreController('api::menu.menu', ({ strapi }) => {
  const menus = strapi.service('api::menu.menu') as GenericService;
  const currentDate = new Date();
  const currentDateTimeString = currentDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const currentDateTime = new Date(currentDateTimeString);

  function getCurrentMenu(allMenus: API.Cart.MenuQuery) {
    return allMenus.results
      .filter((menu) => new Date(menu.release_date) <= currentDateTime)
      .sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateB.getTime() - dateA.getTime();
      })[0];
  }

  return {
    async find() {
      try {
        const allMenus = (await menus.find!({
          populate: {
            monday_lunch: true,
            monday_dinner: true,
            tuesday_lunch: true,
            tuesday_dinner: true,
            wednesday_lunch: true,
            wednesday_dinner: true,
            thursday_lunch: true,
            thursday_dinner: true,
            friday_lunch: true,
            friday_dinner: true,
            snack_01: true,
            snack_02: true,
            salad_01: true,
            salad_02: true,
            release_date: true
          }
        })) as API.Cart.MenuQuery;

        const currentMenu = getCurrentMenu(allMenus); // Call getCurrentMenu

        return {
          message: 'Menu retrieved successfully',
          menu: currentMenu
        };
      } catch (error) {
        return {
          message: 'Error retrieving menu',
          error: error
        };
      }
    }
  };
});

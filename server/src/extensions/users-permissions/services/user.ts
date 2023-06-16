import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default {
  async createCartRelations(sanitizedUser: any) {
    const cartDay = strapi.service('api::cart-day.cart-day') as GenericService;
    const cart = strapi.service('api::cart.cart') as GenericService;

    const myCart = await cart.create!({
      data: {
        user: sanitizedUser.id
      },
      populate: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true
      }
    });

    const mondayCart = await cartDay.create!({
      data: {
        day: 'monday',
        user: sanitizedUser.id
      }
    });
    const tuesdayCart = await cartDay.create!({
      data: {
        day: 'tuesday',
        user: sanitizedUser.id
      }
    });
    const wednesdayCart = await cartDay.create!({
      data: {
        day: 'wednesday',
        user: sanitizedUser.id
      }
    });
    const thursdayCart = await cartDay.create!({
      data: {
        day: 'thursday',
        user: sanitizedUser.id
      }
    });
    const fridayCart = await cartDay.create!({
      data: {
        day: 'friday',
        user: sanitizedUser.id
      }
    });

    await cart.update!(myCart.id, {
      data: {
        days: [mondayCart.id, tuesdayCart.id, wednesdayCart.id, thursdayCart.id, fridayCart.id]
      },
      populate: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true
      }
    });
  }
};

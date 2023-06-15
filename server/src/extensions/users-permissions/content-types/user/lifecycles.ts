import { GenericService } from '@strapi/strapi/lib/core-api/service';

export default {
  async afterCreate(event: API.Auth.UserAfterCreationLifecycleEvent) {
    const cartDay = strapi.service('api::cart-day.cart-day') as GenericService;
    const cart = strapi.service('api::cart.cart') as GenericService;

    const myCart = await cart.create!({
      data: {
        user: event.result.id
      },
      populate: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true
      }
    });

    const mondaySheet = await cartDay.create!({
      data: {
        day: 'monday'
      }
    });
    const tuesdaySheet = await cartDay.create!({
      data: {
        day: 'tuesday'
      }
    });
    const wednesdaySheet = await cartDay.create!({
      data: {
        day: 'wednesday'
      }
    });
    const thursdaySheet = await cartDay.create!({
      data: {
        day: 'thursday'
      }
    });
    const fridaySheet = await cartDay.create!({
      data: {
        day: 'friday'
      }
    });

    const sheets = {
      mondaySheet,
      tuesdaySheet,
      wednesdaySheet,
      thursdaySheet,
      fridaySheet
    };

    await cart.update!(myCart.id, {
      data: {
        days: [mondaySheet.id, tuesdaySheet.id, wednesdaySheet.id, thursdaySheet.id, fridaySheet.id]
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

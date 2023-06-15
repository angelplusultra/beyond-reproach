/* eslint-disable */
namespace API {
  type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  interface Route {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    handler: string;
    config: {
      middlewares: Middleware[];
      auth: boolean;
      prefix: string;
    };
  }

  type Middleware = (ctx: Context<any, any>, next: import('connect').NextFunction) => Promise<void>;
  interface RouteConfig {
    auth: boolean;
    prefix: string;
    middlewares: Middleware[];
  }
  interface Context<Body = null, Query = null> {
    request: {
      body: Body;
      query: Query;
      url: string;
    };
    params: {
      id: string;
    };
    state: {
      auth: any;
      session?: import('stripe').Stripe.Response<import('stripe').Stripe.Checkout.Session>;
    };
    badRequest: (message: string, details?: object) => void;
    redirect: (url: string) => void;
    send: (data: any) => void;
  }
  namespace Cart {
    interface Cart {
      monday: DaySheet;
      tuesday: DaySheet;
      wednesday: DaySheet;
      thursday: DaySheet;
      friday: DaySheet;
    }

    interface CartMealItem {
      id: string;
      meal: Meal.Meal['id'];
      quantity: number;
      protein: number;
      accommodate_allergies: number[];
      cart_day: CartDay['id'];
    }
    interface CartBundleItem {
      id: string;
      bundle: number;
      quantity: number;
      lunch_protein: number;
      dinner_protein: number;
      lunch_accomodate_allergies: number[];
      dinner_accomodate_allergies: number[];
      snack: number;
    }
    interface CartDay {
      id: string;
      lunches: CartMealItem[];
      dinners: CartMealItem[];
      bundles: CartBundleItem[];
    }
  }

  namespace Auth {
    interface UsersPermissionsPlugin {
      controllers: {
        auth: any;
      };
      contentTypes: {
        user: any;
      };
      routes: {
        'content-api': {
          routes: Route[];
        };
      };
    }
    interface UserAfterCreationLifecycleEvent {
      result: {
        id: number;
        username: string;
        password: string;
      };
    }
    interface RegisterNewUserRequestBody {
      username: string;
      email: string;
      password: string;
      street: string;
      city: string;
      state: string;
      zipcode: string;
    }
    interface MembershipCheckoutSuccessQuery {
      session_id?: string;
    }
  }

  interface CreateNewCartItemMealRequestBody {
    meal: number;
    accommodate_allergies: number[];
    quantity: number;
    protein: number;
    cartDayId: string;
    type: 'lunch' | 'dinner';
  }
  interface UpdateCartItemMealRequestBody {
    mealItemId: string;
  }
}

namespace Meal {
  interface Meal {
    id: number;
  }
}

declare module '@strapi/plugin-users-permissions/server/controllers/validation/auth';

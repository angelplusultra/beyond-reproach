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
      user: {
        id: number;
        username: string;
        email: string;
        password: string;
        street: string;
        city: string;
        state: string;
        zipcode: string;
        cartDay?: Cart.CartDay;
        role: {
          id: number;
          name: string;
          description: string;
        };
      };
      saladItem?: Cart.CartItemSalad;
      snackItem?: Cart.CartItemSnack;
      session?: import('stripe').Stripe.Response<import('stripe').Stripe.Checkout.Session>;
    };
    badRequest: (message: string, details?: object) => void;
    unauthorized: (message: string, details?: object) => void;
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
    interface CreateNewCartItemMealRequestBody {
      meal: string;
      accommodate_allergies?: number[];
      omitted_ingredients?: number[];
      quantity: number;
      protein_substitute?: number;
      cart_day: string;
    }

    interface CartItemMeal {
      id: string;
      meal: Meal.Meal['id'];
      quantity: number;
      protein: number;
      accommodate_allergies: number[];
      cart_day: CartDay['id'];
      user: {
        id: number;
        username: string;
        password: string;
      };
    }
    interface CartItemSalad {
      id: string;
      salad: number;
      quantity: number;
      omitted_ingredients: number[];
      user?: {
        id: number;
        username: string;
        password: string;
      };
    }
    interface CreateNewCartItemSaladRequestBody {
      salad: string;
      quantity: number;
      omitted_ingredients: number[];
      cart_day: CartDay['id'];
    }
    interface CartItemSnack {
      snack: number;
      quantity: number;
      user?: {
        id: number;
        username: string;
        password: string;
      };
    }

    interface CreateNewCartItemSnackRequestBody {
      snack: string;
      quantity: number;
      cart_day: CartDay['id'];
    }

    interface CreateNewCartItemBundleRequestBody {
      lunch: string;
      dinner: string;
      quantity: number;
      bundle_snack: number;
      lunch_protein_substitute?: number;
      dinner_protein_substitute?: number;
      lunch_accomodate_allergies?: number[];
      dinner_accomodate_allergies?: number[];
      lunch_omitted_ingredients?: number[];
      dinner_omitted_ingredients?: number[];
      cart_day: string;
    }
    interface CartItemBundle {
      id: string;
      lunch: number;
      dinner: number;
      quantity: number;
      bundle_snack: number;
      lunch_protein_substitute?: number;
      dinner_protein_substitute?: number;
      lunch_accomodate_allergies?: number[];
      dinner_accomodate_allergies?: number[];
      lunch_omitted_ingredients?: number[];
      dinner_omitted_ingredients?: number[];
      cart_day: number;
      user?: {
        id: number;
        username: string;
        password: string;
      };
    }
    interface CartDay {
      id: string;
      lunches: CartItemMeal[];
      dinners: CartItemMeal[];
      bundles: CartItemBundle[];
      salads: CartItemSalad[];
      snacks: CartItemSnack[];
      day: Day;
      user?: {
        id: number;
        username: string;
        password: string;
      };
    }
  }

  namespace Auth {
    interface User {
      username: string;
      email: string;
      password: string;
      provider: string;
      resetPasswordToken: string;
      confirmationToken: string;
      confirmed: boolean;
      blocked: boolean;
      role?: number;
      cart?: number;
      allergies?: number[];
      street: string;
      city: string;
      state: string;
      zipcode: string;
    }
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

  interface UpdateCartItemMealRequestBody {
    mealItemId: string;
  }
}

namespace ContentType {
  interface Meal {
    id: number;
  }
}

declare module '@strapi/plugin-users-permissions/server/controllers/validation/auth';
declare module '*.png';

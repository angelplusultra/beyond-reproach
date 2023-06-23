/* eslint-disable */

namespace Strapi {
  type env = (ev: string) => void;
}
namespace API {
  type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  type MealType = 'lunch' | 'dinner';

  namespace ContentType {
    interface Meal {
      id: number;
      title: string;
      accomodated_allergies: Allergy[];
      allergies: Allergy[];
      protein_substitutes: Protein[];
      price: number;
      omittable_ingredients: Ingredient[];
      type: MealType;
    }
    interface Ingredient {
      name: string;
      id: string;
    }
    interface Protein {
      title: string;
      id: string;
    }
    interface Allergy {
      type: string;
      id: string;
    }
    interface Snack {
      id: string;
      title: string;
      price: number;
    }
    interface Salad {
      id: string;
      title: string;
      price: number;
      omittable_ingredients: Ingredient[];
    }
  }
  interface Route {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    handler: string;
    config: {
      middlewares: Middleware[];
      auth?: boolean;
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
        stripe_id: string;
        role: {
          id: number;
          name: string;
          description: string;
        };
      };
      bundleItem?: Cart.CartItemBundle;
      mealItem?: Cart.CartItemMeal;
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
      total: number;
      id: string;
    }

    interface CartQuery {
      results: Cart[];
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

      meal: ContentType.Meal;
      quantity: number;
      total: number;
      protein: number;
      accommodate_allergies: ContentType.Allergy[];
      protein_substitute: ContentType.Protein;
      omitted_ingredients: ContentType.Ingredient[];
      cart_day: CartDay;
      user: Auth.User;
    }
    interface CartItemMealQuery {
      results: CartItemMeal[];
    }
    interface CartItemSalad {
      id: string;
      salad: ContentType.Salad;
      quantity: number;
      total: number;
      cart_day: CartDay;
      omitted_ingredients: ContentType.Ingredient[];
      user?: Auth.User;
    }

    interface CartItemSaladQuery {
      results: CartItemSalad[];
    }
    interface CreateNewCartItemSaladRequestBody {
      salad: string;
      quantity: number;
      omitted_ingredients?: number[];
      cart_day: CartDay['id'];
    }
    interface CartItemSnack {
      id: string;
      snack: ContentType.Snack;
      quantity: number;
      total: number;
      cart_day: CartDay;
      user?: Auth.User;
    }

    interface CartItemSnackQuery {
      results: CartItemSnack[];
    }

    interface CartDayQuery {
      results: CartDay[];
    }

    interface CreateNewCartItemSnackRequestBody {
      snack: string;
      quantity: number;
      cart_day: CartDay['id'];
    }

    interface CartItemDeleteRequestQuery {
      all: string;
    }

    interface CreateNewCartItemBundleRequestBody {
      lunch: string;
      dinner: string;
      quantity: number;
      bundle_snack: number;
      lunch_protein_substitute?: number;
      dinner_protein_substitute?: number;
      lunch_accommodate_allergies?: number[];
      dinner_accommodate_allergies?: number[];
      lunch_omitted_ingredients?: number[];
      dinner_omitted_ingredients?: number[];
      cart_day: string;
    }
    interface CartItemBundle {
      id: string;
      lunch: ContentType.Meal;
      dinner: ContentType.Meal;
      quantity: number;

      total: number;

      bundle_snack: ContentType.Snack;
      lunch_protein_substitute?: ContentType.Protein;
      dinner_protein_substitute?: ContentType.Protein;
      lunch_accommodate_allergies?: ContentType.Allergy[];
      dinner_accommodate_allergies?: ContentType.Allergy[];
      lunch_omitted_ingredients?: ContentType.Ingredient[];
      dinner_omitted_ingredients?: ContentType.Ingredient[];
      cart_day: CartDay;
      user?: Auth.User;
    }

    interface CartItemBundleQuery {
      results: CartItemBundle[];
    }
    interface CartDay {
      id: string;
      lunches: CartItemMeal[];
      dinners: CartItemMeal[];
      bundles: CartItemBundle[];
      salads: CartItemSalad[];
      snacks: CartItemSnack[];
      day: Day;
      user?: Auth.User;
    }
  }

  namespace Auth {
    interface User {
      id: number;
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
      stripe_id: string;
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

declare module '@strapi/plugin-users-permissions/server/controllers/validation/auth';
declare module '*.png';

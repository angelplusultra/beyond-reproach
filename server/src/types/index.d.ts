namespace API {
  type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

  interface Context<Body> {
    request: {
      body: Body;
    };
    params: {
      id: string;
    };
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
    interface UserAfterCreationLifecycleEvent {
      result: {
        id: number;
        username: string;
        password: string;
      };
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

namespace API {
  type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  type SheetType = 'meal' | 'bundle';

  interface Context<T> {
    request: {
      body: T;
    };
  }
  interface CreateNewMealSheetRequestBody {
    meal: number;
    accomodate_allergies: number[];
    quantity: number;
    protein: number;
    daySheet: string;
    type: 'lunch' | 'dinner';
  }
}

namespace Cart {
  interface Cart {
    monday: DaySheet;
    tuesday: DaySheet;
    wednesday: DaySheet;
    thursday: DaySheet;
    friday: DaySheet;
  }

  interface MealSheet {
    id: number;
    meal: Meal.Meal['id'];
    quantity: number;
    protein: number;
    accomodate_allergies: number[];
  }
  interface BundleSheet {
    id: number;
    bundle: number;
    quantity: number;
    lunch_protein: number;
    dinner_protein: number;
    lunch_accomodate_allergies: number[];
    dinner_accomodate_allergies: number[];
    snack: number;
  }
  interface DaySheet {
    lunches: MealSheet[];
    dinners: MealSheet[];
    bundles: BundleSheet[];
  }
}

namespace Meal {
  interface Meal {
    id: number;
  }
}

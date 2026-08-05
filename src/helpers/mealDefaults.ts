export const FALLBACK_MEAL_IMAGE_URL = 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Meal';

export const generateMealFoodCode = (mealName: string) => {
  const nameSegment =
    mealName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '')
      .slice(0, 10) || 'MEAL';
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${nameSegment}-${randomSegment}`;
};

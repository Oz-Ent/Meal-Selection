import { generateMealFoodCode, FALLBACK_MEAL_IMAGE_URL } from './mealDefaults';
import { parseMealName } from './parsers';
import { availableMeals } from './availableMeals';

describe('mealDefaults.generateMealFoodCode', () => {
  it('builds a code from the sanitized, uppercased name plus a random suffix', () => {
    const code = generateMealFoodCode('Rice & Goat Stew!');
    expect(code).toMatch(/^RICEGOATST-[A-Z0-9]+$/);
  });

  it('uses MEAL when the name has no alphanumeric characters', () => {
    expect(generateMealFoodCode('*** ---')).toMatch(/^MEAL-[A-Z0-9]+$/);
  });

  it('exposes a fallback image url', () => {
    expect(FALLBACK_MEAL_IMAGE_URL).toContain('placehold');
  });
});

describe('parsers.parseMealName', () => {
  it('returns an empty string for empty input', () => {
    expect(parseMealName('')).toBe('');
  });

  it('abbreviates "with" and "and" and collapses whitespace', () => {
    expect(parseMealName('Rice  with Beans and   Egg')).toBe('Rice w/ Beans & Egg');
  });
});

describe('availableMeals', () => {
  it('exposes a non-empty list with id/title/imageUrl', () => {
    expect(availableMeals.length).toBeGreaterThan(0);
    for (const meal of availableMeals) {
      expect(meal).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          imageUrl: expect.any(String),
        }),
      );
    }
  });
});

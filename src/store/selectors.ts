import { AppState } from './index';
import { createSelector } from 'reselect';

const WEEK_CAP = 1800 * 7;

const getFoods = (state: AppState) => state.foods;
const getToday = () => new Date().setHours(0, 0, 0, 0);

const calcCaloriesTakenUntilYesterday = createSelector(
  [getFoods, getToday],
  (foods, today) => {
    const foodsUntilYesterday = foods.filter(
      food => food.date.getTime() < today
    );
    return sumCalorie(foodsUntilYesterday);
  }
);

const calcCaloriesTakenToday = createSelector(
  [getFoods, getToday],
  (foods, today) => {
    const foodsToday = foods.filter(food => food.date.getTime() >= today);
    return sumCalorie(foodsToday);
  }
);

const sumCalorie = (foods: AppState['foods']) =>
  foods.reduce((acc, food) => acc + food.kcal, 0);

const calcTodayCap = createSelector(
  [calcCaloriesTakenUntilYesterday, getToday],
  (caloriesTakenUntilYesterday, today) => {
    const restCalories = WEEK_CAP - caloriesTakenUntilYesterday;
    const restDays = 7 - new Date(today).getDay();

    const calculatedDailyCalorie = restCalories / restDays;
    const standardDailyCalorie = WEEK_CAP / 7;

    return Math.min(calculatedDailyCalorie, standardDailyCalorie);
  }
);

export const progressSelector = createSelector(
  [calcTodayCap, calcCaloriesTakenToday, calcCaloriesTakenUntilYesterday],
  (todayCap, caloriesTakenToday, caloriesTakenUntilYesterday) => ({
    todayCap: todayCap,
    weekCap: WEEK_CAP,
    today: caloriesTakenToday,
    week: caloriesTakenUntilYesterday + caloriesTakenToday
  })
);
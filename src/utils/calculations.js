export const calculateMacros = (weight, height, age, gender, goal, activityLevel, diet, dailyRoutine, bodyType) => {
  // Mifflin-St Jeor Equation
  let s = gender === 'Male' ? 5 : -161;
  let bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

  // NEAT Multiplier based on daily activity and routine
  let neatFactor = 0.15;
  if (dailyRoutine === 'On my feet all day') neatFactor += 0.2;
  
  const neatMultipliers = {
    'Sedentary': 0.15,
    'Lightly Active': 0.3,
    'Moderately Active': 0.45,
    'Very Active': 0.6,
    'Athlete': 0.75
  };
  neatFactor = Math.max(neatFactor, neatMultipliers[activityLevel] || 0.15);
  
  // Body type adjustment (slight metabolism variations)
  if (bodyType === 'Ectomorph') neatFactor += 0.05; // faster metabolism
  if (bodyType === 'Endomorph') neatFactor -= 0.05; // slower metabolism

  const neat = bmr * neatFactor;

  // Workout Burn Estimate (varies by goal/intensity)
  let workoutBurn = 0;
  if (goal === 'Cut (Lose Fat)') workoutBurn = 400;
  else if (goal === 'Strength' || goal === 'Bulk (Gain Muscle)') workoutBurn = 250;
  else workoutBurn = 350; // Hypertrophy/Recomp

  const tdee = bmr + neat + workoutBurn;

  // Target Calories based on Goal
  let calories = tdee;
  if (goal === 'Cut (Lose Fat)') {
    calories -= 500;
  } else if (goal === 'Muscle Hypertrophy' || goal === 'Strength' || goal === 'Bulk (Gain Muscle)') {
    calories += 400; // 300-500kcal surplus
  }

  // Professional Nutritionist Macro Calculation
  // Protein (g/kg)
  let pMultiplier = 1.8; 
  if (goal === 'Cut (Lose Fat)' || goal === 'Fat Loss') {
    pMultiplier = 2.2; // Higher protein to preserve muscle in deficit
  } else if (goal === 'Muscle Hypertrophy' || goal === 'Strength' || goal === 'Bulk (Gain Muscle)') {
    pMultiplier = 2.0;
  }
  let protein = Math.round(weight * pMultiplier);

  // Fats (g/kg)
  let fMultiplier = 1.0;
  if (gender === 'Female') fMultiplier = 1.2; // Hormonal health baseline
  let fats = Math.round(weight * fMultiplier);

  let proteinCals = protein * 4;
  let fatsCals = fats * 9;

  let carbs = 0;

  if (diet === 'Keto') {
    carbs = 30; // strict keto carbs
    let carbCals = carbs * 4;
    // Remainder of calories goes to fats
    fatsCals = calories - proteinCals - carbCals;
    fats = Math.max(Math.round(weight * 1.0), Math.round(fatsCals / 9));
    fatsCals = fats * 9;
    
    // Recalibrate protein if there's still a gap
    proteinCals = calories - fatsCals - carbCals;
    protein = Math.max(protein, Math.round(proteinCals / 4));
  } else {
    let remainingCals = calories - proteinCals - fatsCals;
    
    if (remainingCals < 0) {
      // Very low calories, reduce fats to absolute minimum 0.8g/kg
      fats = Math.round(weight * 0.8);
      fatsCals = fats * 9;
      remainingCals = calories - proteinCals - fatsCals;
    }
    
    carbs = Math.max(0, Math.round(remainingCals / 4));
  }

  // Ensure perfect sum
  calories = (protein * 4) + (carbs * 4) + (fats * 9);

  return {
    bmr: Math.round(bmr),
    neat: Math.round(neat),
    workoutBurn: Math.round(workoutBurn),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    protein,
    carbs,
    fats
  };
};

export const getMealRecommendations = (country, diet, sensitivities = [], goal = '') => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const regionMap = {
    'Lebanon': {
      lunch: { 
        name: 'Tabbouleh (low oil) & Grilled Chicken', protein: 35, carbs: 45, fats: 10,
        prepTime: '20 mins',
        ingredients: ['1 cup Parsley', '100g Chicken Breast', '1 tbsp Olive Oil', 'Lemon juice', 'Tomato'],
        steps: ['Chop parsley and tomatoes.', 'Grill chicken breast.', 'Mix veggies with lemon and olive oil.', 'Serve together.']
      },
      dinners: [
        { 
          name: 'Grilled Tawook with Hummus', protein: 45, carbs: 20, fats: 15,
          prepTime: '25 mins', ingredients: ['200g Chicken breast', '2 tbsp Hummus', 'Garlic', 'Lemon'], steps: ['Marinate chicken in garlic and lemon.', 'Grill on skewers.', 'Serve with a side of hummus.']
        },
        { 
          name: 'Lean Kafta Skewers', protein: 40, carbs: 10, fats: 18,
          prepTime: '20 mins', ingredients: ['200g Lean Ground Beef', 'Parsley', 'Onion', 'Spices'], steps: ['Mix beef with chopped parsley and onion.', 'Form into skewers.', 'Grill until cooked through.']
        },
        { 
          name: 'Kibbeh Bil Sanieh (Baked, Lean)', protein: 38, carbs: 35, fats: 12,
          prepTime: '45 mins', ingredients: ['150g Lean Beef', '50g Bulgur', 'Pine nuts', 'Spices'], steps: ['Mix beef and bulgur.', 'Layer in a baking dish with pine nuts in the middle.', 'Bake until golden.']
        },
        { 
          name: 'Hindbeh (Dandelion Greens) with Chicken', protein: 35, carbs: 15, fats: 14,
          prepTime: '30 mins', ingredients: ['200g Dandelion greens', '150g Chicken breast', 'Garlic', 'Onions'], steps: ['Boil greens then sauté with garlic and onions.', 'Grill chicken on the side.']
        },
        { 
          name: 'Mujadara (Lentils & Rice)', protein: 25, carbs: 50, fats: 10,
          prepTime: '40 mins', ingredients: ['100g Lentils', '50g Rice', 'Caramelized Onions'], steps: ['Boil lentils until tender.', 'Add rice and cook together.', 'Top with onions.']
        },
        { 
          name: 'Shish Barak (Baked, Light Yogurt)', protein: 30, carbs: 40, fats: 15,
          prepTime: '60 mins', ingredients: ['Lean beef dumplings', 'Low-fat yogurt', 'Garlic', 'Mint'], steps: ['Bake dumplings instead of frying.', 'Cook yogurt gently.', 'Mix together with garlic and mint.']
        },
        { 
          name: 'Fatteh Hummus (Baked Pita)', protein: 25, carbs: 45, fats: 12,
          prepTime: '15 mins', ingredients: ['Chickpeas', 'Low-fat Yogurt', 'Baked Pita Bread', 'Garlic'], steps: ['Layer baked pita.', 'Add warm chickpeas.', 'Top with garlic yogurt.']
        }
      ]
    },
    'USA': {
      lunch: { 
        name: 'Turkey Wrap', protein: 30, carbs: 35, fats: 12,
        prepTime: '10 mins', ingredients: ['Turkey breast', 'Whole wheat wrap', 'Spinach', 'Mustard'], steps: ['Layer ingredients on wrap.', 'Roll tightly.', 'Serve.']
      },
      dinners: [
        { name: 'Grilled Chicken Breast & Veggies', protein: 45, carbs: 20, fats: 10, prepTime: '20 mins', ingredients: ['Chicken', 'Broccoli'], steps: ['Grill chicken.', 'Steamed broccoli.'] },
        { name: 'Lean Beef Steak', protein: 40, carbs: 0, fats: 15, prepTime: '15 mins', ingredients: ['Steak'], steps: ['Pan sear steak.'] },
        { name: 'Baked Salmon', protein: 35, carbs: 10, fats: 18, prepTime: '25 mins', ingredients: ['Salmon', 'Asparagus'], steps: ['Bake salmon and asparagus at 400F.'] },
        { name: 'Turkey Chili', protein: 38, carbs: 30, fats: 8, prepTime: '40 mins', ingredients: ['Ground turkey', 'Beans', 'Tomato'], steps: ['Cook turkey.', 'Simmer with beans and tomato.'] },
        { name: 'Lentil Curry', protein: 25, carbs: 50, fats: 10, prepTime: '30 mins', ingredients: ['Lentils', 'Curry paste', 'Coconut milk'], steps: ['Boil lentils.', 'Simmer with curry paste.'] },
        { name: 'Tofu Stir-fry', protein: 22, carbs: 25, fats: 12, prepTime: '15 mins', ingredients: ['Tofu', 'Mixed veggies', 'Soy sauce'], steps: ['Stir fry tofu.', 'Add veggies and sauce.'] },
        { name: 'Egg White Omelet', protein: 30, carbs: 5, fats: 10, prepTime: '10 mins', ingredients: ['Egg whites', 'Spinach'], steps: ['Cook omelet in non-stick pan.'] }
      ]
    }
  };

  const selectedRegion = regionMap[country] || regionMap['USA'];

  const weeklyPlan = days.map((day, index) => {
    let dinner = { ...selectedRegion.dinners[index] };
    let lunch = { ...selectedRegion.lunch };
    
    let breakfast = { 
      name: 'Protein Oats', protein: 25, carbs: 40, fats: 10,
      prepTime: '5 mins', ingredients: ['Oats', 'Whey Protein', 'Berries'], steps: ['Mix oats and water.', 'Microwave 2 mins.', 'Stir in protein and top with berries.']
    };
    
    let snack = { 
      name: 'Greek Yogurt & Almonds', protein: 15, carbs: 10, fats: 12,
      prepTime: '2 mins', ingredients: ['Greek Yogurt', 'Almonds'], steps: ['Mix and eat.']
    };

    if (goal === 'Bulk (Gain Muscle)') {
      dinner.name += ' with Extra Rice';
      dinner.carbs += 30;
      lunch.name += ' & Sweet Potato';
      lunch.carbs += 25;
    } else if (goal === 'Cut (Lose Fat)') {
      dinner.name += ' on a Bed of Greens';
      dinner.carbs = Math.max(0, dinner.carbs - 15);
      lunch.name += ' & Big Salad';
      breakfast.name = 'Egg Whites & Veggie Scramble';
      breakfast.carbs = 10;
    }

    return {
      day,
      meals: [
        { type: 'Breakfast', ...breakfast },
        { type: 'Lunch', ...lunch },
        { type: 'Dinner', ...dinner },
        { type: 'Snack', ...snack }
      ]
    };
  });

  return weeklyPlan;
};

// Expose full database for smart swapping
export const getFullRecipeDatabase = (country) => {
  const db = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const plan = getMealRecommendations(country, 'None', [], '');
  plan.forEach(day => {
    day.meals.forEach(m => db.push(m));
  });
  return db;
};

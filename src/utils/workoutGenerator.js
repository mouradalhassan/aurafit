// Pro-Coach Algorithm Implementation

const getVolumeForGoal = (goal) => {
  if (goal === 'Bulk (Gain Muscle)' || goal === 'Strength') return { sets: 4, reps: '5-8', rest: '120s' };
  if (goal === 'Cut (Lose Fat)') return { sets: 4, reps: '12-15', rest: '45s' }; // Metabolic conditioning
  // Default Hypertrophy / Recomp
  return { sets: 4, reps: '8-12', rest: '90s' };
};

const gifCatalog = {
  squat: 'https://media.giphy.com/media/xT1R9Qx6oZk1wZ1Ntu/giphy.gif',
  bench: 'https://media.giphy.com/media/3o7TKWpu2WClyXy3q8/giphy.gif', 
  deadlift: 'https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif',
  pushup: 'https://media.giphy.com/media/3oEhmZ9GngBtv3E9yw/giphy.gif',
  row: 'https://media.giphy.com/media/d2YW1B3sC2k2iV7W/giphy.gif',
  default: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif'
};

const imgCatalog = {
  chest: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400',
  shoulders: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400',
  triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&q=80&w=400',
  biceps: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&q=80&w=400',
  legs: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&q=80&w=400',
  glutes: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
  calves: 'https://images.unsplash.com/photo-1580261450046-d0a30080dc9b?auto=format&fit=crop&q=80&w=400'
};

const exerciseDB = {
  anchors: {
    Push: {
      free: [{ name: 'Barbell Bench Press', gif: gifCatalog.bench, muscle: 'chest' }, { name: 'Overhead Press', gif: gifCatalog.default, muscle: 'shoulders' }],
      machine: [{ name: 'Chest Press Machine', gif: gifCatalog.bench, muscle: 'chest' }, { name: 'Smith Machine OHP', gif: gifCatalog.default, muscle: 'shoulders' }],
      home: [{ name: 'Push-ups', gif: gifCatalog.pushup, muscle: 'chest' }, { name: 'Pike Push-ups', gif: gifCatalog.pushup, muscle: 'shoulders' }]
    },
    Pull: {
      free: [{ name: 'Barbell Deadlift', gif: gifCatalog.deadlift, muscle: 'back' }, { name: 'Barbell Row', gif: gifCatalog.row, muscle: 'back' }],
      machine: [{ name: 'Lat Pulldown', gif: gifCatalog.row, muscle: 'back' }, { name: 'Seated Cable Row', gif: gifCatalog.row, muscle: 'back' }],
      home: [{ name: 'Doorway Rows', gif: gifCatalog.row, muscle: 'back' }, { name: 'Water Jug Rows', gif: gifCatalog.row, muscle: 'back' }]
    },
    Legs: {
      free: [{ name: 'Barbell Squat', gif: gifCatalog.squat, muscle: 'legs' }, { name: 'Romanian Deadlift', gif: gifCatalog.deadlift, muscle: 'glutes' }],
      machine: [{ name: 'Leg Press Machine', gif: gifCatalog.squat, muscle: 'legs' }, { name: 'Smith Machine Squat', gif: gifCatalog.squat, muscle: 'legs' }],
      home: [{ name: 'Bodyweight Squats', gif: gifCatalog.squat, muscle: 'legs' }, { name: 'Bulgarian Split Squats (on chair)', gif: gifCatalog.squat, muscle: 'legs' }]
    }
  },
  accessories: {
    Push: {
      gym: [
        { name: 'Incline Dumbbell Press', equip: 'Dumbbells', gif: gifCatalog.bench, muscle: 'chest' },
        { name: 'Lateral Raises', equip: 'Dumbbells', gif: gifCatalog.default, muscle: 'shoulders' },
        { name: 'Tricep Extensions', equip: 'Cable', gif: gifCatalog.default, muscle: 'triceps' },
        { name: 'Pec Deck Flyes', equip: 'Machine', gif: gifCatalog.default, muscle: 'chest' }
      ],
      home: [
        { name: 'Chair Dips', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'triceps' },
        { name: 'Water Jug Lateral Raises', equip: 'Household', gif: gifCatalog.default, muscle: 'shoulders' },
        { name: 'Diamond Push-ups', equip: 'Bodyweight', gif: gifCatalog.pushup, muscle: 'triceps' },
        { name: 'Plank to Push-up', equip: 'Bodyweight', gif: gifCatalog.pushup, muscle: 'chest' }
      ]
    },
    Pull: {
      gym: [
        { name: 'Lat Pulldowns', equip: 'Cable', gif: gifCatalog.row, muscle: 'back' },
        { name: 'Face Pulls', equip: 'Cable', gif: gifCatalog.default, muscle: 'shoulders' },
        { name: 'Bicep Curls', equip: 'Dumbbells', gif: gifCatalog.default, muscle: 'biceps' },
        { name: 'Hammer Curls', equip: 'Dumbbells', gif: gifCatalog.default, muscle: 'biceps' }
      ],
      home: [
        { name: 'Towel Pull-ups (if door allows)', equip: 'Household', gif: gifCatalog.row, muscle: 'back' },
        { name: 'Superman Holds', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'back' },
        { name: 'Backpack Bicep Curls', equip: 'Household', gif: gifCatalog.default, muscle: 'biceps' },
        { name: 'Reverse Snow Angels', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'back' }
      ]
    },
    Legs: {
      gym: [
        { name: 'Walking Lunges', equip: 'Dumbbells', gif: gifCatalog.default, muscle: 'legs' },
        { name: 'Leg Curls', equip: 'Machine', gif: gifCatalog.default, muscle: 'glutes' },
        { name: 'Leg Extensions', equip: 'Machine', gif: gifCatalog.default, muscle: 'legs' },
        { name: 'Calf Raises', equip: 'Machine', gif: gifCatalog.default, muscle: 'calves' }
      ],
      home: [
        { name: 'Walking Lunges', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'legs' },
        { name: 'Glute Bridges', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'glutes' },
        { name: 'Step-ups (on sturdy chair)', equip: 'Household', gif: gifCatalog.default, muscle: 'legs' },
        { name: 'Single-leg Calf Raises', equip: 'Bodyweight', gif: gifCatalog.default, muscle: 'calves' }
      ]
    }
  }
};

const getRoutineByMuscleGroup = (group, isBeginner, locationPref, vol) => {
  const isHome = locationPref === 'Home';
  
  let anchors;
  if (isHome) anchors = exerciseDB.anchors[group].home;
  else anchors = isBeginner ? exerciseDB.anchors[group].machine : exerciseDB.anchors[group].free;
  
  const anchor = anchors[Math.floor(Math.random() * anchors.length)];
  
  const accPool = isHome ? exerciseDB.accessories[group].home : exerciseDB.accessories[group].gym;
  const accessories = accPool.slice(0, 4).map(ex => ({
    name: ex.name,
    equipment: ex.equip,
    sets: vol.sets,
    reps: vol.reps,
    rest: vol.rest,
    gifUrl: ex.gif,
    muscleImg: imgCatalog[ex.muscle] || imgCatalog['chest']
  }));

  return [
    { name: anchor.name, equipment: isHome ? 'Bodyweight' : (isBeginner ? 'Machine' : 'Barbell'), sets: vol.sets, reps: vol.reps, rest: vol.rest, gifUrl: anchor.gif, muscleImg: imgCatalog[anchor.muscle] || imgCatalog['chest'] },
    ...accessories
  ];
};

export const generateWorkoutPlan = (goal, daysPerWeek, locationPref, experienceLevel) => {
  const isBeginner = experienceLevel === 'New';
  const vol = getVolumeForGoal(goal);
  
  let splitPattern = [];
  // Frequency Equation (F)
  if (daysPerWeek <= 3) {
    // Full Body Split
    splitPattern = ['FullBody', 'Rest', 'FullBody', 'Rest', 'FullBody', 'Rest', 'Rest'];
  } else if (daysPerWeek === 4) {
    // Upper / Lower Split
    splitPattern = ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'];
  } else {
    // PPL Split (5 or more days)
    splitPattern = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'];
  }

  const generateFullBody = () => {
    const pushA = getRoutineByMuscleGroup('Push', isBeginner, locationPref, vol)[0];
    const pullA = getRoutineByMuscleGroup('Pull', isBeginner, locationPref, vol)[0];
    const legA = getRoutineByMuscleGroup('Legs', isBeginner, locationPref, vol)[0];
    const pushAcc = locationPref === 'Home' ? exerciseDB.accessories.Push.home[1] : exerciseDB.accessories.Push.gym[1];
    const pullAcc = locationPref === 'Home' ? exerciseDB.accessories.Pull.home[2] : exerciseDB.accessories.Pull.gym[2];
    
    return [
      pushA, pullA, legA, 
      { name: pushAcc.name, equipment: pushAcc.equip, sets: vol.sets, reps: vol.reps, rest: vol.rest, gifUrl: pushAcc.gif, muscleImg: imgCatalog[pushAcc.muscle] },
      { name: pullAcc.name, equipment: pullAcc.equip, sets: vol.sets, reps: vol.reps, rest: vol.rest, gifUrl: pullAcc.gif, muscleImg: imgCatalog[pullAcc.muscle] }
    ];
  };

  const generateUpper = () => {
    const push = getRoutineByMuscleGroup('Push', isBeginner, locationPref, vol);
    const pull = getRoutineByMuscleGroup('Pull', isBeginner, locationPref, vol);
    return [push[0], pull[0], push[1], pull[1], push[2]];
  };

  const generateLower = () => {
    return getRoutineByMuscleGroup('Legs', isBeginner, locationPref, vol);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const plan = [];

  for (let i = 0; i < 7; i++) {
    const type = splitPattern[i];
    let routine = [];
    
    if (type === 'Push' || type === 'Pull' || type === 'Legs') {
      routine = getRoutineByMuscleGroup(type, isBeginner, locationPref, vol);
    } else if (type === 'FullBody') {
      routine = generateFullBody();
    } else if (type === 'Upper') {
      routine = generateUpper();
    } else if (type === 'Lower') {
      routine = generateLower();
    }

    plan.push({
      dayIndex: i,
      dayName: days[i],
      isRestDay: type === 'Rest',
      type: type,
      routine: routine
    });
  }

  return plan;
};

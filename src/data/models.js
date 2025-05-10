// Example exercise structure
export const exampleExercise = {
  name: "Bench Press",
  type: "Push",
  history: [
    {
      date: 1715251200000, // UNIX timestamp
      sets: [
        { reps: 8, weight: 135 },
        { reps: 6, weight: 145 },
      ],
    },
  ],
};

// Example workout structure by day
export const exampleWorkoutLog = {
  "2025-05-09": {
    date: 1715251200000, // UNIX timestamp
    exercises: [
      {
        name: "Bench Press",
        type: "Push",
        sets: [
          { reps: 8, weight: 135 },
          { reps: 6, weight: 145 },
        ],
      },
    ],
  },
};

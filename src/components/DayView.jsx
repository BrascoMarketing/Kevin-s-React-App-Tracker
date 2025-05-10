import { loadExerciseLogs, saveExerciseLog } from "../utils/storage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";

const schedule = {
  Sunday: "Rest",
  Monday: "Push",
  Tuesday: "Pull",
  Wednesday: "Legs",
  Thursday: "Push",
  Friday: "Pull",
  Saturday: "Legs",
};

function getExerciseDayKey(exerciseId, date) {
  const midnightTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return `${exerciseId}-${midnightTimestamp}`;
}

export default function DayView({ library }) {
  const [viewedDate, setViewedDate] = useState(new Date());

function getCategoryForDate(date) {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  return schedule[dayName];
}

const viewedCategory = getCategoryForDate(viewedDate);
const [exerciseStates, setExerciseStates] = useState({});

useEffect(() => {
  const savedLogs = loadExerciseLogs();
  const initialStates = {};

  savedLogs.forEach((log) => {
    const dayKey = getExerciseDayKey(log.exerciseId, new Date(log.date));
    initialStates[dayKey] = {
      sets: log.sets,
      completed: log.completed,
      completedDate: log.date,
    };
  });

  setExerciseStates(initialStates);
}, [viewedDate]);

  const exercisesForToday = library.filter((ex) => ex.type === viewedCategory);

  if (viewedCategory === "Rest") {
    const navigation = (
        <div className="flex items-center justify-center space-x-4 mb-4">
            <button
            onClick={() =>
                setViewedDate(
                new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() - 1)
                )
            }
            className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
            ⬅️ Previous
            </button>

            <button
            onClick={() => setViewedDate(new Date())}
            className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
            📅 Today
            </button>

            <button
            onClick={() =>
                setViewedDate(
                new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() + 1)
                )
            }
            className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
            Next ➡️
            </button>
        </div>
        );
    return (
        <div className="bg-gray-900 text-white rounded-xl shadow-md p-4 w-full max-w-md mx-auto mt-8">
            {navigation}
            <h2 className="text-xl font-bold">Rest Day 😎</h2>
            <p>Enjoy your recovery!</p>
        </div>
        );
  }

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-4 w-full max-w-4xl mx-auto">

        <div className="flex items-center justify-center space-x-4 mb-4">
            <button
                onClick={() =>
                setViewedDate(
                    new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() - 1)
                )
                }
                className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
                ⬅️ Previous
            </button>

            <button
                onClick={() => setViewedDate(new Date())}
                className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
                📅 Today
            </button>

            <button
                onClick={() =>
                setViewedDate(
                    new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() + 1)
                )
                }
                className="px-2 py-1 border border-gray-600 rounded hover:bg-gray-700"
            >
                Next ➡️
            </button>
            </div>


        <h2 className="text-xl font-bold mb-4">Day Type: {viewedCategory}</h2>
        <p className="mb-4">
            {viewedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      {exercisesForToday.length === 0 ? (
        <p>No exercises assigned for today.</p>
      ) : (
        exercisesForToday.map((ex) => {
            const stateKey = getExerciseDayKey(ex.id, viewedDate);
            const currentState = exerciseStates[stateKey] || { sets: [], completed: false };

            const handleAddSet = (reps, weight) => {
            const updatedSets = [...currentState.sets, { reps, weight }];
            setExerciseStates({
              ...exerciseStates,
              [stateKey]: { ...currentState, sets: updatedSets },
            });
          };

          const handleDeleteSet = (indexToDelete) => {
            const updatedSets = currentState.sets.filter((_, index) => index !== indexToDelete);
            setExerciseStates({
              ...exerciseStates,
              [stateKey]: { ...currentState, sets: updatedSets },
            });
          };

          const handleToggleCompletion = () => {
            const newCompleted = !currentState.completed;
            setExerciseStates({
            ...exerciseStates,
            [stateKey]: { ...currentState, completed: newCompleted, completedDate: newCompleted ? Date.now() : null },
            });

            if (newCompleted) {
              saveExerciseLog({
                id: uuidv4(),
                exerciseId: ex.id,
                name: ex.name,
                type: viewedCategory,
                date: viewedDate.getTime(),
                sets: currentState.sets,
                completed: newCompleted,
                completedDate: newCompleted ? Date.now() : null,
              });
            }
          };

          return (
            <div key={ex.id} className="border border-gray-700 rounded p-2 mb-4 bg-gray-800">
              <h3 className="font-semibold mb-2">{ex.name}</h3>

              {!currentState.completed && <SetLogger onAddSet={handleAddSet} />}

              <ul className="list-disc list-inside mb-2">
                {currentState.sets.map((set, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span>{set.reps} reps @ {set.weight} lbs</span>
                    <button
                      onClick={() => handleDeleteSet(i)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>

              {!currentState.completed ? (
                <button
                  onClick={handleToggleCompletion}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Mark as Done ✅
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-green-400">
                    ✅ Completed on{" "}
                    {new Date(currentState.completedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                    </p>
                  <button
                    onClick={handleToggleCompletion}
                    className="text-yellow-400 hover:underline"
                  >
                    Unmark
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function SetLogger({ onAddSet }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reps || !weight) return;
    onAddSet(parseInt(reps), parseFloat(weight));
    setReps("");
    setWeight("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-2 mb-2">
      <input
        className="bg-gray-700 text-white border border-gray-600 p-1 w-16"
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
      />
      <input
        className="bg-gray-700 text-white border border-gray-600 p-1 w-24"
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-2 py-1 rounded"
      >
        Add Set
      </button>
    </form>
  );
}

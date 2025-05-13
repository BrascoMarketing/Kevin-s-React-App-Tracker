import { loadExerciseLogs } from "../utils/storage";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, CalendarDaysIcon, PlusIcon, TrashIcon, ArrowUturnLeftIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

// Generate unique key for each exercise on a specific day
function getExerciseDayKey(exerciseId, date) {
  const midnightTimestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return `${exerciseId}-${midnightTimestamp}`;
}

// Safely get the category assigned for a given date
function getCategoryForDate(date) {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const savedSchedule = JSON.parse(localStorage.getItem("weeklySchedule")) || {};
  return savedSchedule[dayName] || "Rest";
}

export default function DayView({ exercises, categoryOrder, viewedDate, setViewedDate, setExerciseLogs }) {
  const [exerciseStates, setExerciseStates] = useState({});

  const viewedCategory = getCategoryForDate(viewedDate);
  const exerciseIdsForToday = categoryOrder[viewedCategory] || [];
  const exercisesForToday = exerciseIdsForToday.map((id) => exercises[id]).filter(Boolean);

  const savedLogs = loadExerciseLogs();
  const getLastLogForExercise = (exerciseId) => {
    const logs = savedLogs.filter((log) => log.exerciseId === exerciseId).sort((a, b) => b.date - a.date);
    return logs[0] || null;
  };

  useEffect(() => {
    const initialStates = {};
    savedLogs.forEach((log) => {
      const dayKey = getExerciseDayKey(log.exerciseId, new Date(log.date));
      initialStates[dayKey] = { sets: log.sets, completed: log.completed, completedDate: log.date };
    });
    setExerciseStates(initialStates);
  }, [viewedDate]);

  if (viewedCategory === "Rest") {
    return (
      <div className="bg-zinc-900 text-white rounded-xl shadow-md p-4 w-full max-w-md mx-auto">
        <Navigation viewedDate={viewedDate} setViewedDate={setViewedDate} />
        <h2 className="text-xl font-bold">Rest Day</h2>
        <p>Enjoy your recovery!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
      <Navigation viewedDate={viewedDate} setViewedDate={setViewedDate} />
      <h2 className="text-white text-xl font-bold mb-4">Workout: {viewedCategory}</h2>
      <p className="text-white mb-4">{viewedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

      {exercisesForToday.length === 0 ? (
        <p>No exercises assigned for today.</p>
      ) : (
        exercisesForToday.map((ex) => {
          const stateKey = getExerciseDayKey(ex.id, viewedDate);
          const currentState = exerciseStates[stateKey] || { sets: [], completed: false };
          const lastLog = getLastLogForExercise(ex.id);

          return (
            <div key={ex.id} className="text-white indi-exercise border border-gray-700 rounded p-2 mb-4 bg-zinc-800">
              <h3 className="font-semibold mb-2">{ex.name}</h3>
              <p className="text-sm text-gray-400 mb-2">Target Sets: {ex.targetSets || 3}</p>

              {lastLog && lastLog.sets.length > 0 && (
                <div className="text-sm text-gray-400 mb-2">
                  <strong>Last Logged:</strong>{" "}
                  {lastLog.sets.map((set, i) => (
                    <span key={i}>{set.reps} reps @ {set.weight} lbs{ i < lastLog.sets.length - 1 ? ", " : "" }</span>
                  ))}
                </div>
              )}

              {!currentState.completed && (
                <SetLogger
                  onAddSet={(reps, weight) => {
                    const updatedSets = [...currentState.sets, { reps, weight }];
                    setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, sets: updatedSets } });
                  }}
                  useBodyweight={ex.useBodyweight}
                  userBodyWeight={parseFloat(localStorage.getItem("userBodyWeight") || 0)}
                />
              )}

              <ul className="list-disc list-inside mb-2">
                {currentState.sets.map((set, i) => (
                  <li key={i} className="flex items-center space-x-2 mb-1">
                    <span>{set.reps} reps @ {set.weight} lbs</span>
                    <button onClick={() => {
                      const updatedSets = currentState.sets.filter((_, index) => index !== i);
                      setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, sets: updatedSets } });
                    }} className="text-red-400 hover:underline">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              {!currentState.completed ? (
                <button onClick={() => {
                  const newCompleted = !currentState.completed;
                  setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, completed: newCompleted, completedDate: Date.now() } });

                  if (newCompleted) {
                    const updatedLogs = loadExerciseLogs().filter(log => !(log.exerciseId === ex.id && new Date(log.date).toDateString() === viewedDate.toDateString()));
                    const logEntry = { id: uuidv4(), exerciseId: ex.id, name: ex.name, type: viewedCategory, date: viewedDate.getTime(), sets: currentState.sets, completed: newCompleted, completedDate: Date.now() };
                    updatedLogs.push(logEntry);
                    localStorage.setItem("exerciseLogs", JSON.stringify(updatedLogs));
                    setExerciseLogs(updatedLogs);
                  }
                }} className="completion bg-green-600 text-white px-2 py-1 rounded">
                  Mark as Done
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="flex items-center text-green-400">
                    <CheckBadgeIcon className="h-4 w-4 mr-1" /> Completed on {new Date(currentState.completedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <button onClick={() => {
                    setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, completed: false } });
                  }} className="text-yellow-400 hover:underline">
                    <ArrowUturnLeftIcon className="h-4 w-4" />
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

function Navigation({ viewedDate, setViewedDate }) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <button onClick={() => setViewedDate(new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() - 1))} className="flex items-center text-sm text-white px-2 py-1 rounded hover:bg-gray-700">
        <ChevronDoubleLeftIcon className="h-4 w-4 mr-1" /> Previous
      </button>
      <button onClick={() => setViewedDate(new Date())} className="flex items-center text-sm text-white px-2 py-1 rounded hover:bg-gray-700">
        <CalendarDaysIcon className="h-4 w-4 mr-1" /> Today
      </button>
      <button onClick={() => setViewedDate(new Date(viewedDate.getFullYear(), viewedDate.getMonth(), viewedDate.getDate() + 1))} className="flex items-center text-sm text-white px-2 py-1 rounded hover:bg-gray-700">
        Next <ChevronDoubleRightIcon className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
}

function SetLogger({ onAddSet, useBodyweight, userBodyWeight }) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState(useBodyweight ? userBodyWeight : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reps || !weight) return;
    onAddSet(parseInt(reps), parseFloat(weight));
    setReps("");
    setWeight("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-x-2 mb-2">
      <input className="bg-gray-700 text-white border border-gray-600 p-1 w-16" type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
      <input className="bg-gray-700 text-white border border-gray-600 p-1 w-24" type="number" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <button type="submit" className="flex items-center bg-blue-500 text-white py-1 rounded">
        <PlusIcon className="h-4 w-4 mr-1" /> Add Set
      </button>
    </form>
  );
}

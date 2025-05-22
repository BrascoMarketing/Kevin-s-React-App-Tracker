import { loadExerciseLogs } from "../utils/storage";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, CalendarDaysIcon, PlusIcon, TrashIcon, ArrowUturnLeftIcon, CheckBadgeIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Process logs to get volume data for charting
function getVolumeDataForExercise(exerciseId, savedLogs) {
  const volumeByDate = {};

  // Filter logs for the specific exercise
  const exerciseLogs = savedLogs.filter((log) => log.exerciseId === exerciseId);

  // Calculate total volume (sum of reps * weight) per date
  exerciseLogs.forEach((log) => {
    const date = new Date(log.date);
    // Format date as MM-DD-YY
    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}-${String(date.getFullYear()).slice(-2)}`;
    const totalVolume = log.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
    volumeByDate[formattedDate] = totalVolume;
  });

  // Sort dates and prepare chart data
  const sortedDates = Object.keys(volumeByDate).sort((a, b) => new Date(a) - new Date(b));
  const volumes = sortedDates.map((date) => volumeByDate[date]);

  return {
    labels: sortedDates,
    volumes,
  };
}

// Line chart component
function LineChart({ exerciseId, exerciseName, savedLogs }) {
  const { labels, volumes } = getVolumeDataForExercise(exerciseId, savedLogs);

  // Find the type from the most recent log for this exercise
  const exerciseLog = savedLogs
    .filter((log) => log.exerciseId === exerciseId)
    .sort((a, b) => b.date - a.date)[0]; // Get the most recent log
  const exerciseType = exerciseLog ? exerciseLog.type : "UNKNOWN"; // Fallback if no log exists

  // Map exercise type to a color
  const typeToColorMap = {
    Pull: "#10B981", // Green (already used)
    Push: "#EF4444", // Red
    Legs: "#3B82F6", // Blue
    Freestyle: "#F59E0B", // Yellow
    UNKNOWN: "#6B7280", // Gray (fallback for unknown types)
  };

  const lineColor = typeToColorMap[exerciseType] || typeToColorMap.UNKNOWN;

  const data = {
    labels,
    datasets: [
      {
        label: `Volume (Reps * Weight)`,
        data: volumes,
        borderColor: lineColor, // Use the dynamic color based on type
        backgroundColor: lineColor.replace(/[^,]+(?=\))/, "0.2"), // Adjust opacity for background
        fill: false,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: false,
        text: `${exerciseName} Volume Over Time`,
        color: '#fff',
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} lbs`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
          maxRotation: 0,
          minRotation: 0,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#fff',
          maxTicksLimit: 4,
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        title: {
          display: true,
          text: 'Volume (lbs)',
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="chart-holder h-50 mb-4">
      <Line data={data} options={options} />
    </div>
  );
}

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

  const [isToggled, setIsToggled] = useState(false);
  const [isShowSets, setIsShowSets] = useState(false);

  const toggleClass = () => {
    setIsToggled(!isToggled);
  };
  const toggleShowSets = () => {
    setIsShowSets(!isShowSets);
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
    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
      <button className="text-white absolute right-4" onClick={toggleClass}>
        {!isToggled ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
      </button>
      
      <Navigation viewedDate={viewedDate} setViewedDate={setViewedDate} />
      <h2 className="text-white text-xl font-bold mb-4">Workout: {viewedCategory}</h2>
      <p className="text-white mb-4">{viewedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="flex justify-end mb-2">
        <button className="text-white" onClick={toggleShowSets}>
          {!isShowSets ? <div className="flex items-center"><EyeIcon className="h-4 w-4 mr-2" />Show Stats</div> : <div className="flex items-center"><EyeSlashIcon className="h-4 w-4 mr-2" />Hide Stats</div>}
        </button>
      </div>

      {exercisesForToday.length === 0 ? (
        <p>No exercises assigned for today.</p>
      ) : (
        <div className={`${!isToggled ? 'exercises-wrapper active' : 'exercises-wrapper'} ${!isShowSets ? 'showsetsNo' : 'showsetsYes'}`}>
          <div className="scroll-window">
            {exercisesForToday.map((ex) => {
              const stateKey = getExerciseDayKey(ex.id, viewedDate);
              const currentState = exerciseStates[stateKey] || { sets: [], completed: false };
              const lastLog = getLastLogForExercise(ex.id);

              return (
                <div
                  key={ex.id}
                  className={`text-white indi-exercise border border-gray-700 rounded p-2 mb-4 bg-zinc-800 ${
                    currentState.completed ? 'completed-exercise' : ''
                  }`}
                >
                  <h3 className="font-semibold mb-2 text-xl">{ex.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 target-sets">Target Sets: {ex.targetSets || 3}</p>                
                  <LineChart exerciseId={ex.id} exerciseName={ex.name} savedLogs={savedLogs} />
                  

                  {lastLog && lastLog.sets.length > 0 && (
                    <div className="text-sm text-gray-400 mb-4 last-logged">
                      <strong>Last Logged:</strong>{" "}
                      {lastLog.sets.map((set, i) => (
                        <span key={i}>
                          {set.reps} reps @ {set.weight} lbs{i < lastLog.sets.length - 1 ? " " : ""}
                        </span>
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

                  <ul className="list-disc list-inside mb-2 sets-done">
                    {currentState.sets.map((set, i) => (
                      <li key={i} className="flex items-center space-x-2 mb-1">
                        <span>
                          {set.reps} reps @ {set.weight} lbs
                        </span>
                        <button
                          onClick={() => {
                            const updatedSets = currentState.sets.filter((_, index) => index !== i);
                            setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, sets: updatedSets } });
                          }}
                          className="text-red-400 hover:underline"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {!currentState.completed ? (
                    <button
                      onClick={() => {
                        const newCompleted = !currentState.completed;
                        setExerciseStates({
                          ...exerciseStates,
                          [stateKey]: { ...currentState, completed: newCompleted, completedDate: Date.now() },
                        });

                        if (newCompleted) {
                          const updatedLogs = loadExerciseLogs().filter(
                            (log) =>
                              !(log.exerciseId === ex.id && new Date(log.date).toDateString() === viewedDate.toDateString())
                          );
                          const logEntry = {
                            id: uuidv4(),
                            exerciseId: ex.id,
                            name: ex.name,
                            type: viewedCategory,
                            date: viewedDate.getTime(),
                            sets: currentState.sets,
                            completed: newCompleted,
                            completedDate: Date.now(),
                          };
                          updatedLogs.push(logEntry);
                          localStorage.setItem("exerciseLogs", JSON.stringify(updatedLogs));
                          setExerciseLogs(updatedLogs);
                        }
                      }}
                      className="completion bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Mark as Done
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="flex items-center text-green-400">
                        <CheckBadgeIcon className="h-4 w-4 mr-1" /> Completed
                      </p>
                      <button
                        onClick={() => {
                          setExerciseStates({ ...exerciseStates, [stateKey]: { ...currentState, completed: false } });
                        }}
                        className="text-yellow-400 hover:underline"
                      >
                        <ArrowUturnLeftIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
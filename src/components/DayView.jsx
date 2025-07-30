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
  const setsByDate = {};

  // Filter logs for the specific exercise
  const exerciseLogs = savedLogs.filter((log) => log.exerciseId === exerciseId);

  // Calculate total volume and store sets per date
  exerciseLogs.forEach((log) => {
    const date = new Date(log.date);
    // Format date as MM-DD
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    const totalVolume = log.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
    volumeByDate[formattedDate] = totalVolume;
    setsByDate[formattedDate] = log.sets; // Store the sets for this date
  });

  // Sort dates and prepare chart data
  const sortedDates = Object.keys(volumeByDate).sort((a, b) => new Date(a) - new Date(b));
  const volumes = sortedDates.map((date) => volumeByDate[date]);
  const sets = sortedDates.map((date) => setsByDate[date] || []);

  return {
    labels: sortedDates,
    volumes,
    sets, // Include sets in the returned object
  };
}

// Line chart component
function LineChart({ exerciseId, exerciseName, savedLogs }) {
  const { labels, volumes, sets } = getVolumeDataForExercise(exerciseId, savedLogs);

  // Find the type from the most recent log for this exercise
  const exerciseLog = savedLogs
    .filter((log) => log.exerciseId === exerciseId)
    .sort((a, b) => b.date - a.date)[0];
  const exerciseType = exerciseLog ? exerciseLog.type : "UNKNOWN";

  // Map exercise type to a color
  const typeToColorMap = {
    Pull: "#10B981",
    Push: "#ff6467",
    Legs: "#3B82F6",
    Freestyle: "#F59E0B",
    UNKNOWN: "#6B7280",
  };

  const lineColor = typeToColorMap[exerciseType] || typeToColorMap.UNKNOWN;

  const data = {
    labels,
    datasets: [
      {
        label: `Volume (Reps * Weight)`,
        data: volumes,
        borderColor: lineColor,
        backgroundColor: lineColor.replace(/[^,]+(?=\))/, "0.2"),
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
        enabled: true,
        padding: 12,
        yAlign: 'top',
        caretPadding: 2,
        usePointStyle: false,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const volume = context.raw;
            const dateIndex = context.dataIndex;
            const setsForDate = sets[dateIndex] || [];
            const tooltipLines = [`Volume: ${volume} lbs`];
            if (setsForDate.length > 0) {
              setsForDate.forEach((set) => {
                tooltipLines.push(`${set.reps} reps @ ${set.weight} lbs`);
              });
            } else {
              tooltipLines.push('No sets logged');
            }
            return tooltipLines;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff',
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 6,
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#fff',
          maxTicksLimit: 5,
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
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg text-white h-full">
      <Navigation viewedDate={viewedDate} setViewedDate={setViewedDate} />
      <h2 className="text-xl font-bold mb-4">Rest Day - Weekly Summary</h2>
      {savedLogs.length > 0 ? (
        <WeeklySummary savedLogs={savedLogs} viewedDate={viewedDate} />
      ) : (
        <p>No workout data available for this week. Enjoy your rest day!</p>
      )}
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
                  className={`text-white indi-exercise border border-gray-700 rounded p-2 mb-4 bg-gray-900 ${
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
                          // Dispatch custom event
                          window.dispatchEvent(new Event('exerciseLogsUpdated'));
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

// Calculate weekly volume data for a given week (Monday to Saturday)
function getWeeklyVolumeData(savedLogs, viewedDate) {
  const volumeByDate = {};

  // Get the start of the week (Monday) relative to viewedDate (Sunday)
  const dayOfWeek = viewedDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(viewedDate);
  startOfWeek.setDate(viewedDate.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0); // Start at midnight

  // Initialize the 6 days (Monday to Saturday)
  for (let i = 0; i < 6; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const formattedDate = `${currentDay.getMonth() + 1}-${currentDay.getDate()}`;
    volumeByDate[formattedDate] = 0;
  }

  // Filter logs for the past week (Monday to Saturday)
  const weekStartTimestamp = startOfWeek.getTime();
  const weekEndTimestamp = new Date(startOfWeek);
  weekEndTimestamp.setDate(startOfWeek.getDate() + 5);
  weekEndTimestamp.setHours(23, 59, 59, 999); // End at the last moment of Saturday

  const weeklyLogs = savedLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getTime() >= weekStartTimestamp && logDate.getTime() <= weekEndTimestamp.getTime();
  });

  // Sum the volume for each day
  weeklyLogs.forEach((log) => {
    const date = new Date(log.date);
    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}`;
    const totalVolume = log.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
    volumeByDate[formattedDate] = (volumeByDate[formattedDate] || 0) + totalVolume;
  });

  // Prepare chart data
  const sortedDates = Object.keys(volumeByDate).sort((a, b) => {
    const [monthA, dayA] = a.split('-').map(Number);
    const [monthB, dayB] = b.split('-').map(Number);
    return new Date(startOfWeek.getFullYear(), monthA - 1, dayA) - new Date(startOfWeek.getFullYear(), monthB - 1, dayB);
  });
  const volumes = sortedDates.map((date) => volumeByDate[date]);

  return {
    labels: sortedDates,
    volumes,
  };
}

// Calculate total volume for a specific week
function getTotalVolumeForWeek(savedLogs, startOfWeek) {
  const weekStartTimestamp = startOfWeek.getTime();
  const weekEndTimestamp = new Date(startOfWeek);
  weekEndTimestamp.setDate(startOfWeek.getDate() + 5);
  weekEndTimestamp.setHours(23, 59, 59, 999);

  const weeklyLogs = savedLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getTime() >= weekStartTimestamp && logDate.getTime() <= weekEndTimestamp.getTime();
  });

  return weeklyLogs.reduce((sum, log) => {
    const totalVolume = log.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
    return sum + totalVolume;
  }, 0);
}

// Weekly summary chart component
function WeeklySummary({ savedLogs, viewedDate }) {
  const { labels, volumes } = getWeeklyVolumeData(savedLogs, viewedDate);
  const topExercises = getTopExercises(savedLogs, viewedDate);

  // Calculate total volume for this week
  const thisWeekVolume = volumes.reduce((sum, vol) => sum + vol, 0);

  // Calculate total volume for previous week
  const dayOfWeek = viewedDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfThisWeek = new Date(viewedDate);
  startOfThisWeek.setDate(viewedDate.getDate() - daysToMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const lastWeekVolume = getTotalVolumeForWeek(savedLogs, startOfLastWeek);

  // Calculate volume difference
  const volumeDifference = thisWeekVolume - lastWeekVolume;
  const differenceText = volumeDifference >= 0 ? `+${volumeDifference.toLocaleString()}` : volumeDifference.toLocaleString();

  const data = {
    labels,
    datasets: [
      {
        label: `Total Volume (Reps * Weight)`,
        data: volumes,
        borderColor: "#10B981",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
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
        text: `Weekly Volume (Monday - Saturday)`,
        color: '#fff',
        font: { size: 16 },
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
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="chart-holder h-50 mb-4">
        <Line data={data} options={options} />
      </div>
      <p className="text-gray-400 text-sm text-center text-yellow-500">
        Total volume lifted this week: <strong className="text-green-400">{thisWeekVolume.toLocaleString()} lbs</strong>
      </p>
      <p className="text-gray-400 text-sm text-center">
        Compared to last week: <strong className={volumeDifference >= 0 ? "text-green-400" : "text-red-400"}>{differenceText} lbs</strong>
      </p>
      <div className="mt-8">
        <h2 className="text-white font-bold mb-2 text-lg">Top 10 Exercises This Week</h2>
        {topExercises.length > 0 ? (
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-gray-600">
              <th className="text-left py-2">Exercise</th>
              <th className="text-right py-2">Total Volume (lbs)</th>
              </tr>
            </thead>
            <tbody>
              {topExercises.map((exercise, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-2">{exercise.name}</td>
                  <td className="text-right py-2">{exercise.volume.toLocaleString()} lbs</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">No exercise data available for this week.</p>
        )}
      </div>
    </div>
  );
}

function getTopExercises(savedLogs, viewedDate) {
  const volumeByExercise = {};

  // Get the start of the week (Monday) and end (Saturday)
  const dayOfWeek = viewedDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(viewedDate);
  startOfWeek.setDate(viewedDate.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekStartTimestamp = startOfWeek.getTime();
  const weekEndTimestamp = new Date(startOfWeek);
  weekEndTimestamp.setDate(startOfWeek.getDate() + 5);
  weekEndTimestamp.setHours(23, 59, 59, 999);

  // Filter logs for the week
  const weeklyLogs = savedLogs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getTime() >= weekStartTimestamp && logDate.getTime() <= weekEndTimestamp.getTime();
  });

  // Sum volume by exercise
  weeklyLogs.forEach((log) => {
    const totalVolume = log.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
    const exerciseKey = `${log.exerciseId}-${log.name}`; // Unique key to avoid name collisions
    if (!volumeByExercise[exerciseKey]) {
      volumeByExercise[exerciseKey] = {
        name: log.name,
        volume: 0,
      };
    }
    volumeByExercise[exerciseKey].volume += totalVolume;
  });

  // Convert to array, sort by volume, and take top 10
  const topExercises = Object.values(volumeByExercise)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return topExercises;
}
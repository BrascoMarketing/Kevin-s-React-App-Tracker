import { useState, useEffect } from "react";
import { loadExerciseLibrary, saveExerciseLibrary } from "./utils/storage";
import ExerciseFormPanel from "./components/ExerciseFormPanel";
import ExerciseLibraryColumns from "./components/ExerciseLibraryColumns";
import DayView from "./components/DayView";
import VolumeChart from "./components/VolumeChart";
import { loadExerciseLogs } from "./utils/storage";
import CalendarPanel from "./components/CalendarPanel";
import DailyProgressRing from './components/DailyProgressRing';
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";

const schedule = {
  Sunday: "Rest",
  Monday: "Push",
  Tuesday: "Pull",
  Wednesday: "Legs",
  Thursday: "Push",
  Friday: "Pull",
  Saturday: "Freestyle",
};

function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState(loadExerciseLogs());
  const [viewedDate, setViewedDate] = useState(new Date());

  const viewedKey = viewedDate.toDateString();

  const viewedLogs = exerciseLogs.filter(log =>
    new Date(log.date).toDateString() === viewedKey
  );

const totalLoggedSetsForViewedDay = viewedLogs.reduce((sum, log) => sum + log.sets.length, 0);

const viewedDayName = viewedDate.toLocaleDateString("en-US", { weekday: "long" });
const viewedCategory = schedule[viewedDayName];

const todayExerciseObjects = exerciseLibrary.filter(
  (ex) => ex.type.includes(viewedCategory)
);
const targetSets = todayExerciseObjects.reduce(
  (sum, ex) => sum + (ex.targetSets || 3),
  0
);

  // Load from LocalStorage when app starts
  useEffect(() => {
    const savedLibrary = loadExerciseLibrary();  
    setExerciseLibrary(savedLibrary);
    setHasLoaded(true); // ✅ Mark as loaded
  }, []);

  // Save to LocalStorage whenever library changes
  useEffect(() => {
  if (!hasLoaded) return; // ✅ Block premature save  
  saveExerciseLibrary(exerciseLibrary);
}, [exerciseLibrary, hasLoaded]);

  return (
    <div>      
      <div className="p-12 space-y-4">
        <div className="flex justify-end text-gray-200 mb-4">
          <UserCircleIcon className="h-6 w-6 mr-1" />
          <Cog8ToothIcon className="h-6 w-6 ml-2" />
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          
          <div className="lg:col-span-2 space-y-4">
            <DayView library={exerciseLibrary} viewedDate={viewedDate} setViewedDate={setViewedDate} setExerciseLogs={setExerciseLogs} />
          </div>

          <div className="lg:col-span-4">
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-zinc-900 text-white rounded-xl shadow-md p-4">
                <h2 className="text-white text-xl font-bold mb-4 mt-8">Today's Progress</h2>
                <DailyProgressRing
                  targetSets={targetSets}
                  loggedSets={totalLoggedSetsForViewedDay}
                />
              </div>
              <div className="bg-zinc-900 text-white rounded-xl shadow-md p-4">
                <h2 className="text-white text-xl font-bold">Total Volume</h2>
                <h3 className="text-gray-500 text-xs font-bold mb-4">(Reps x Weight)</h3>
                <VolumeChart logs={exerciseLogs} />
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="bg-zinc-900 text-white rounded-xl shadow-md p-4">      
                <h2 className="text-white text-xl font-bold mb-4">Workout Log</h2>          
                <CalendarPanel viewedDate={viewedDate} setViewedDate={setViewedDate} logs={exerciseLogs} />
              </div>
              <div className="bg-zinc-900 text-white rounded-xl p-4">
                <ExerciseFormPanel library={exerciseLibrary} setLibrary={setExerciseLibrary} />
              </div>
            </div>

          </div>
          
          
        </div>

        <h2 className="text-white text-xl font-bold mb-4 mt-8">Library</h2>
        {/* Second Row */}
        <div className="pt-4 space-y-4">
          <ExerciseLibraryColumns library={exerciseLibrary} setLibrary={setExerciseLibrary} />
        </div>

      </div>
    </div>
  );
}

export default App;
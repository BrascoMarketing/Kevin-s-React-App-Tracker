import { useState, useEffect } from "react";
import { loadExerciseLibrary, saveExerciseLibrary } from "./utils/storage";
import ExerciseFormPanel from "./components/ExerciseFormPanel";
import ExerciseLibraryColumns from "./components/ExerciseLibraryColumns";
import DayView from "./components/DayView";
import VolumeChart from "./components/VolumeChart";
import { loadExerciseLogs } from "./utils/storage";
import CalendarPanel from "./components/CalendarPanel";
import DailyProgressRing from './components/DailyProgressRing';

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

const expectedExercisesForViewedDay = exerciseLibrary.filter(
  (ex) => ex.type === viewedCategory
).length;


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

        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <div className="lg:col-span-1 space-y-4">
            <DayView library={exerciseLibrary} viewedDate={viewedDate} setViewedDate={setViewedDate} setExerciseLogs={setExerciseLogs} />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div class="bg-zinc-900 text-white rounded-xl shadow-md p-4">  

              <DailyProgressRing
                totalExercises={expectedExercisesForViewedDay}
                loggedSets={totalLoggedSetsForViewedDay}
              />

              <VolumeChart logs={exerciseLogs} />
              
              <div className="mt-8">
                <CalendarPanel viewedDate={viewedDate} setViewedDate={setViewedDate} logs={exerciseLogs} />
              </div>

            </div>
          </div>
          
          
        </div>

        <h2 className="text-white text-xl font-bold mb-4 mt-8">Library</h2>

        {/* Second Row */}
        <div className="pt-4 space-y-4">
          <ExerciseLibraryColumns library={exerciseLibrary} setLibrary={setExerciseLibrary} />
        </div>

        {/* Third Row */}
        <div className="p-8 space-y-4">
          <ExerciseFormPanel library={exerciseLibrary} setLibrary={setExerciseLibrary} />
        </div>

      </div>
    </div>
  );
}

export default App;
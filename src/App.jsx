import { useState, useEffect } from "react";
import ExerciseFormPanel from "./components/ExerciseFormPanel";
import ExerciseLibraryColumns from "./components/ExerciseLibraryColumns";
import DayView from "./components/DayView";
import VolumeChart from "./components/VolumeChart";
import { loadExerciseLogs } from "./utils/storage";
import CalendarPanel from "./components/CalendarPanel";
import DailyProgressRing from './components/DailyProgressRing';
import { UserCircleIcon } from "@heroicons/react/24/solid";
import UserProfileModal from "./components/UserProfileModal";
import CategoryManager from "./components/CategoryManager";
import WeeklyScheduleBuilder from "./components/WeeklyScheduleBuilder";

function App() {
  const [weeklySchedule] = useState(() => {
  const saved = localStorage.getItem("weeklySchedule");
  return saved
    ? JSON.parse(saved)
    : {
        Sunday: "Rest",
        Monday: "Rest",
        Tuesday: "Rest",
        Wednesday: "Rest",
        Thursday: "Rest",
        Friday: "Rest",
        Saturday: "Rest",
      };
});
  const [exerciseLibrary, setExerciseLibrary] = useState(() => {
  const saved = localStorage.getItem("exerciseLibrary");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("exerciseLibrary", JSON.stringify(exerciseLibrary));
  }, [exerciseLibrary]);
  const [exerciseLogs, setExerciseLogs] = useState(loadExerciseLogs());
  const [viewedDate, setViewedDate] = useState(new Date());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const viewedKey = viewedDate.toDateString();

  useEffect(() => {
    if (exerciseCategories.length > 0) {
      localStorage.setItem("exerciseCategories", JSON.stringify(exerciseCategories));
    }
  }, [exerciseCategories]);

  const viewedLogs = exerciseLogs.filter(log =>
    new Date(log.date).toDateString() === viewedKey
  );

  const totalLoggedSetsForViewedDay = viewedLogs.reduce((sum, log) => sum + log.sets.length, 0);

  const viewedDayName = viewedDate.toLocaleDateString("en-US", { weekday: "long" });
  const viewedCategory = weeklySchedule[viewedDayName];

  const todayExerciseObjects = exerciseLibrary.filter(
    (ex) => ex.type.includes(viewedCategory)
  );
  const targetSets = todayExerciseObjects.reduce(
    (sum, ex) => sum + (ex.targetSets || 3),
    0
  );

  useEffect(() => {
  const saved = localStorage.getItem("exerciseCategories");
  if (saved) {
    setExerciseCategories(JSON.parse(saved));
  } else {
    const defaultCategories = [
      { id: crypto.randomUUID(), name: "Push" },
      { id: crypto.randomUUID(), name: "Pull" },
      { id: crypto.randomUUID(), name: "Legs" },
      { id: crypto.randomUUID(), name: "Freestyle" },
    ];
    setExerciseCategories(defaultCategories);
    localStorage.setItem("exerciseCategories", JSON.stringify(defaultCategories));
  }
}, []);

  return (
    <>
      {notification && (
          <div className="fixed top-0 left-0 w-full bg-green-600 text-white text-center py-2 z-50 shadow-md">
            {notification}
          </div>
        )}    
    <div>      
      <div className="p-12 space-y-4">
        <div className="flex justify-end text-gray-200 mb-4">
          <button onClick={() => setIsProfileOpen(true)} className="absolute top-4 right-4">
            <UserCircleIcon className="h-6 w-6 text-white" />
          </button>          
        </div>

        {/*Profile Modal Trigger*/}
        {isProfileOpen && (
          <UserProfileModal
            onClose={() => setIsProfileOpen(false)}
            setNotification={setNotification}
          />
        )}

        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          
          <div className="lg:col-span-2 space-y-4">
            <DayView library={exerciseLibrary} viewedDate={viewedDate} setViewedDate={setViewedDate} setExerciseLogs={setExerciseLogs} weeklySchedule={weeklySchedule} />
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
                <ExerciseFormPanel
                  library={exerciseLibrary}
                  setLibrary={setExerciseLibrary}
                  setNotification={setNotification}
                  exerciseCategories={exerciseCategories} 
                />
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
        <div className="pt-4 space-y-4">
          <CategoryManager
            setNotification={setNotification}
            setCategories={setExerciseCategories}
            categories={exerciseCategories}
          />
        </div>
        <div className="pt-4 space-y-4">
          <WeeklyScheduleBuilder
            categories={exerciseCategories}
            setNotification={setNotification}
          />
        </div>

      </div>
    </div>
    </>
  );  
}

export default App;
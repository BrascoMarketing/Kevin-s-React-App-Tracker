import { useState, useEffect } from "react";
import { loadExerciseLibrary, saveExerciseLibrary } from "./utils/storage";
import ExerciseFormPanel from "./components/ExerciseFormPanel";
import ExerciseLibraryColumns from "./components/ExerciseLibraryColumns";
import DayView from "./components/DayView";

function App() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);

  // Load from LocalStorage when app starts
  useEffect(() => {
    const savedLibrary = loadExerciseLibrary();
  console.log("Loaded from LocalStorage on startup:", savedLibrary);
  setExerciseLibrary(savedLibrary);
  setHasLoaded(true); // ✅ Mark as loaded
  }, []);

  // Save to LocalStorage whenever library changes
  useEffect(() => {
  if (!hasLoaded) return; // ✅ Block premature save
  console.log("Effect Triggered - Saving to LocalStorage:", exerciseLibrary);
  saveExerciseLibrary(exerciseLibrary);
}, [exerciseLibrary, hasLoaded]);

  return (
    <div>      
      <div className="p-12 space-y-4">

        {/* First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className=" space-y-4">
            <DayView library={exerciseLibrary} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div class="bg-zinc-900 text-white rounded-xl shadow-md p-4">
              <h3 class="text-lg font-bold mb-2">Placeholder Container</h3>
            </div>
          </div>
        </div>

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
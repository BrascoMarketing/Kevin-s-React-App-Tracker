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

      <div className="p-8 space-y-4">
        <DayView library={exerciseLibrary} />
      </div>      

      <div className="p-8 space-y-4">
        <ExerciseLibraryColumns library={exerciseLibrary} setLibrary={setExerciseLibrary} />
      </div>

      <div className="p-8 space-y-4">
        <ExerciseFormPanel library={exerciseLibrary} setLibrary={setExerciseLibrary} />
      </div>

    </div>
  );
}

export default App;
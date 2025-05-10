// Load exercise library from LocalStorage
export function loadExerciseLibrary() {
  const data = localStorage.getItem("exerciseLibrary");
  return data ? JSON.parse(data) : [];
}

// Save exercise library to LocalStorage
export function saveExerciseLibrary(library) {  
  localStorage.setItem("exerciseLibrary", JSON.stringify(library));
}

// Load exercise logs from LocalStorage
export function loadExerciseLogs() {
  const data = localStorage.getItem("exerciseLogs");
  return data ? JSON.parse(data) : [];
}

// Save a single exercise log to LocalStorage
export function saveExerciseLog(log) {
  const existingLogs = loadExerciseLogs();
  const updatedLogs = [...existingLogs, log];
  localStorage.setItem("exerciseLogs", JSON.stringify(updatedLogs));
}
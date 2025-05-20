import ExerciseFormPanel from './ExerciseFormPanel';

export default function SettingsModal({ 
  exercises,
  setExercises,
  categoryOrder,
  setCategoryOrder,
  exerciseCategories,
  setNotification,
  onClose 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-4 rounded w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">X</button>
        <h2 className="text-xl text-white mb-4">Settings</h2>
        
        <ExerciseFormPanel
          exercises={exercises}
          setExercises={setExercises}
          categoryOrder={categoryOrder}
          setCategoryOrder={setCategoryOrder}
          exerciseCategories={exerciseCategories}
          setNotification={setNotification} 
        />
        
      </div>
    </div>
  );
}

import { useState } from "react";
import CategorySwitch from './CategorySwitch';

export default function ExerciseFormPanel({
  setExercises,
  setCategoryOrder,
  exerciseCategories,
  setNotification
}) {
  const [name, setName] = useState("");
  const [types, setTypes] = useState([]);
  const [targetSetsInput, setTargetSetsInput] = useState(3);
  const [useBodyweight, setUseBodyweight] = useState(false);
  
  const handleAddExercise = (e) => {
  e.preventDefault();
  if (!name.trim() || types.length === 0) return;

  const newExerciseId = crypto.randomUUID();
  const newExercise = {
    id: newExerciseId,
    name: name.trim(),
    type: types,
    targetSets: targetSetsInput || 3,
    useBodyweight,
  };

  // Update exercises
  setExercises((prev) => ({
    ...prev,
    [newExerciseId]: newExercise,
  }));

  // Update categoryOrder
  setCategoryOrder((prevOrder) => {
    const updatedOrder = { ...prevOrder };
    types.forEach((cat) => {
      if (!updatedOrder[cat]) {
        updatedOrder[cat] = [];
      }
      // Prevent duplicate IDs in the order list
      if (!updatedOrder[cat].includes(newExerciseId)) {
        updatedOrder[cat].push(newExerciseId);
      }
    });
    return updatedOrder;
  });

  setName("");
  setTypes([]);
  setUseBodyweight(false);
  setTargetSetsInput(3);

  setNotification(`${newExercise.name} added successfully!`);
  setTimeout(() => setNotification(""), 3000);
};


  return (
    <div className="bg-zinc-900 text-white rounded-xl p-4 w-full mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span>Add New Exercise</span>
      </h2>
      <form onSubmit={handleAddExercise} className="space-y-2">
        <input
          className="bg-zinc-800 text-white border border-gray-700 p-1 pl-2 w-full rounded-md"
          type="text"
          placeholder="Exercise Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="space-y-2">
          {exerciseCategories.map((cat) => (
            <CategorySwitch
              key={cat.id}
              label={cat.name}
              isChecked={types.includes(cat.name)}
              onChange={(isChecked) => {
                if (isChecked) {
                  setTypes([...types, cat.name]);
                } else {
                  setTypes(types.filter((t) => t !== cat.name));
                }
              }}
            />
          ))}
        </div>        
        <label className="target-label block text-sm font-medium text-gray-300 mb-1">
          Target Sets (default is 3)
        </label>
        <input
          type="number"
          min="1"
          value={targetSetsInput}
          onChange={(e) => setTargetSetsInput(parseInt(e.target.value))}
          className="bg-zinc-800 text-white border border-gray-700 p-1 pl-2 w-full rounded-md"
          placeholder="e.g., 3"
        />
        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={useBodyweight}
            onChange={(e) => setUseBodyweight(e.target.checked)}
          />
          <span>Use Bodyweight? (No Weight Entry Needed)</span>
        </label>
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded w-full"
          type="submit"
        >
          Add Exercise
        </button>
      </form>
    </div>
  );
}

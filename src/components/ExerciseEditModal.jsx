import React, { useState, useEffect } from "react";
import CategorySwitch from "./CategorySwitch";

export default function ExerciseEditModal({
  exercise,
  onClose,
  setExercises,
  setCategoryOrder,
  exerciseCategories,
}) {
  const [name, setName] = useState(exercise.name);
  const [targetSets, setTargetSets] = useState(exercise.targetSets || 3);
  const [types, setTypes] = useState(exercise.type || []);
  const [useBodyweight, setUseBodyweight] = useState(exercise.useBodyweight || false);

  // Sync categories on mount (if editing an old exercise with no category set)
  useEffect(() => {
  if (exerciseCategories.length > 0 && types.length === 0) {
      setTypes(exerciseCategories.map((cat) => cat.name));
    }
  }, [exerciseCategories, types]);

  const handleSave = () => {
    const updated = {
      ...exercise,
      name,
      targetSets,
      type: types,
      useBodyweight,
    };

    // Update exercises map
    setExercises((prev) => ({
      ...prev,
      [exercise.id]: updated,
    }));

    // Update categoryOrder: remove ID from removed categories, add to new ones
    setCategoryOrder((prevOrder) => {
      const updatedOrder = { ...prevOrder };

      // Remove from all existing categories
      for (const category in updatedOrder) {
        updatedOrder[category] = updatedOrder[category].filter((id) => id !== exercise.id);
      }

      // Add back to the selected ones
      types.forEach((cat) => {
        if (!updatedOrder[cat]) {
          updatedOrder[cat] = [];
        }
        if (!updatedOrder[cat].includes(exercise.id)) {
          updatedOrder[cat].push(exercise.id);
        }
      });

      return updatedOrder;
    });

    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-lg space-y-4 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit {name}</h2>

        <input
          type="text"
          className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise Name"
        />

        <input
          type="number"
          min="1"
          className="bg-gray-700 border border-gray-600 rounded p-2 w-full mt-2"
          value={targetSets}
          onChange={(e) => setTargetSets(parseInt(e.target.value))}
          placeholder="Target Sets"
        />

        <div className="space-y-2">
          {exerciseCategories.map((cat) => (
            <label key={cat.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={types.includes(cat.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTypes([...types, cat.name]);
                  } else {
                    setTypes(types.filter((t) => t !== cat.name));
                  }
                }}
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>

        <label className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={useBodyweight}
            onChange={(e) => setUseBodyweight(e.target.checked)}
          />
          <span>Use Bodyweight (No Weight Entry Needed)</span>
        </label>

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500">
            Cancel
          </button>
          <button onClick={handleSave} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

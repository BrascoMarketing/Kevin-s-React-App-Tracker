import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function CategoryManager({ setNotification, setCategories, categories, setCategoryOrder }) {  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [hasLoadedCategories, setHasLoadedCategories] = useState(false);  // Flag to prevent premature saving

  // Load or initialize defaults on first mount
useEffect(() => {
  const saved = localStorage.getItem("exerciseCategories");
  let loadedCategories = [];

  if (saved) {
    loadedCategories = JSON.parse(saved);

    // ✅ Ensure "Unassigned" exists if it wasn't already saved
    const hasUnassigned = loadedCategories.some(cat => cat.name === "Unassigned");
    if (!hasUnassigned) {
      loadedCategories.unshift({ id: "unassigned", name: "Unassigned" });
    }
  } else {
    // ✅ First-time setup with defaults + Unassigned
    loadedCategories = [
      { id: "unassigned", name: "Unassigned" },
      { id: uuidv4(), name: "Push" },
      { id: uuidv4(), name: "Pull" },
      { id: uuidv4(), name: "Legs" },
      { id: uuidv4(), name: "Freestyle" },
    ];
  }

  setCategories(loadedCategories);
  localStorage.setItem("exerciseCategories", JSON.stringify(loadedCategories));
  setHasLoadedCategories(true);  // Now safe to start saving
}, []);

  // Save only when categories have fully loaded
  useEffect(() => {
    if (hasLoadedCategories) {
      localStorage.setItem("exerciseCategories", JSON.stringify(categories));
    }
  }, [categories, hasLoadedCategories]);

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const alreadyExists = categories.some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      setError("Category already exists");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newCat = { id: uuidv4(), name: trimmedName };
    setCategories([...categories, newCat]);
    setNewCategoryName("");

    setNotification(`Category "${trimmedName}" added!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleDeleteCategory = (id) => {
  const deletedCategory = categories.find(cat => cat.id === id);
  const updatedCategories = categories.filter((cat) => cat.id !== id);
  setCategories(updatedCategories);

  // Remove from weekly schedule if assigned
  const savedSchedule = JSON.parse(localStorage.getItem("weeklySchedule")) || {};
  const updatedSchedule = {};
  for (const [day, assignedCategory] of Object.entries(savedSchedule)) {
    updatedSchedule[day] = assignedCategory === deletedCategory.name ? "Rest" : assignedCategory;
  }
  localStorage.setItem("weeklySchedule", JSON.stringify(updatedSchedule));

  setNotification(`Category "${deletedCategory.name}" deleted and schedule updated.`);
  setTimeout(() => setNotification(""), 3000);
};

  // Sync schedule when category is renamed
const handleRenameCategory = (id, newName) => {
  const targetCategory = categories.find((cat) => cat.id === id);
  if (!targetCategory) return; // Exit if not found

  const oldName = targetCategory.name;

  // 1. Update exerciseCategories
  const updatedCategories = categories.map((cat) =>
    cat.id === id ? { ...cat, name: newName } : cat
  );
  setCategories(updatedCategories);

  // 2. Sync weekly schedule if this category was assigned to any day
  const savedSchedule = JSON.parse(localStorage.getItem("weeklySchedule")) || {};
  const updatedSchedule = {};
  for (const [day, assignedCategory] of Object.entries(savedSchedule)) {
    updatedSchedule[day] =
      assignedCategory === oldName ? newName : assignedCategory;
  }
  localStorage.setItem("weeklySchedule", JSON.stringify(updatedSchedule));

  // 3. Sync categoryOrder keys if they exist
  setCategoryOrder((prevOrder) => {
    if (!prevOrder[oldName]) return prevOrder; // Skip if category isn't used
    const updatedOrder = { ...prevOrder };
    updatedOrder[newName] = updatedOrder[oldName]; // Move exercises to new key
    delete updatedOrder[oldName]; // Remove old key
    return updatedOrder;
  });

  // 4. Notify success
  setNotification(`Category renamed to "${newName}"`);
  setTimeout(() => setNotification(""), 3000);
};


const [renameInput, setRenameInput] = useState("");
const [renameTargetId, setRenameTargetId] = useState(null);

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
      <h2 className="text-white text-xl font-bold mb-4">Manage Categories</h2>
      
      <ul className="space-y-2">
  {categories.map((cat) => (
    <li key={cat.id} className="p-2 border border-gray-700 rounded flex justify-between items-center bg-zinc-800 text-white shadow hover:bg-gray-700 transition-colors">
      {renameTargetId === cat.id ? (
        <div className="flex space-x-2">
          <input
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 p-1 rounded"
          />
          <button
            onClick={() => {
              handleRenameCategory(cat.id, renameInput);
              setRenameTargetId(null);
              setRenameInput("");
            }}
            className="text-green-400"
          >
            Save
          </button>
          <button
            onClick={() => {
              setRenameTargetId(null);
              setRenameInput("");
            }}
            className="text-red-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span>{cat.name}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setRenameTargetId(cat.id);
                setRenameInput(cat.name);
              }}
              className="text-yellow-400"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(cat.id)}
              className="text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </li>
  ))}
</ul>
<div className="flex space-x-2 mt-6">
        <input
          className="flex-1 bg-zinc-800 text-white border border-gray-600 p-2 rounded"
          type="text"
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

    </div>
  );
}

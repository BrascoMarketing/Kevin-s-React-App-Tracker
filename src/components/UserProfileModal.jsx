import { useState } from "react";

export default function UserProfileModal({ userBodyWeight, setUserBodyWeight, onClose, setNotification }) {
  const [inputWeight, setInputWeight] = useState(userBodyWeight);

  const handleSave = () => {
    setUserBodyWeight(inputWeight);
    localStorage.setItem("userBodyWeight", inputWeight);
    setNotification("Profile updated successfully!");
    setTimeout(() => setNotification(""), 3000);
    onClose();
  };

  const handleExport = () => {
    const data = {
      exercises: JSON.parse(localStorage.getItem("exercises") || "{}"),
      categoryOrder: JSON.parse(localStorage.getItem("categoryOrder") || "{}"),
      weeklySchedule: JSON.parse(localStorage.getItem("weeklySchedule") || "{}"),
      exerciseCategories: JSON.parse(localStorage.getItem("exerciseCategories") || "[]"),
      exerciseLogs: JSON.parse(localStorage.getItem("exerciseLogs") || "[]"),
      userBodyWeight: localStorage.getItem("userBodyWeight") || ""
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "workout-tracker-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.exercises) localStorage.setItem("exercises", JSON.stringify(importedData.exercises));
        if (importedData.categoryOrder) localStorage.setItem("categoryOrder", JSON.stringify(importedData.categoryOrder));
        if (importedData.weeklySchedule) localStorage.setItem("weeklySchedule", JSON.stringify(importedData.weeklySchedule));
        if (importedData.exerciseCategories) localStorage.setItem("exerciseCategories", JSON.stringify(importedData.exerciseCategories));
        if (importedData.exerciseLogs) localStorage.setItem("exerciseLogs", JSON.stringify(importedData.exerciseLogs));
        if (importedData.userBodyWeight) localStorage.setItem("userBodyWeight", importedData.userBodyWeight);

        setNotification("Backup restored successfully! Please refresh to see changes.");
        setTimeout(() => setNotification(""), 3000);
        onClose();
      } catch (err) {
        console.error("Import failed", err);
        setNotification("Failed to import backup. Please check the file format.");
        setTimeout(() => setNotification(""), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-lg space-y-4 w-full max-w-md">

        <h2 className="text-xl font-bold mb-2">Your Profile</h2>

        <div>
          <label className="block mb-1 font-semibold">Body Weight (lbs)</label>
          <input
            type="number"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500">
              Cancel
            </button>
            <button onClick={handleSave} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500">
              Save
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Backup Your Data</h3>
          <button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded">
            Download Backup
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">Restore from Backup</h3>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
          />
        </div>
      </div>
    </div>
  );
}

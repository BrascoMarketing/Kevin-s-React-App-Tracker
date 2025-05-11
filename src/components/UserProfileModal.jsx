import { useState, useEffect } from "react";

export default function UserProfileModal({ onClose, setNotification }) {
  const [bodyWeight, setBodyWeight] = useState("");

  useEffect(() => {
    const savedWeight = localStorage.getItem("userBodyWeight");
    if (savedWeight) setBodyWeight(savedWeight);
  }, []);

  const handleSave = () => {
    localStorage.setItem("userBodyWeight", bodyWeight);
    setNotification("Profile updated successfully!");

    // Auto-hide after 3 seconds
    setTimeout(() => setNotification(""), 3000);

    onClose();
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>
        <label className="block">
          <span className="block mb-1">Body Weight (lbs)</span>
          <input
            type="number"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 p-1 w-full rounded"
          />
        </label>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-600 px-3 py-1 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-green-600 px-3 py-1 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

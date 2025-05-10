import { useState } from "react";

export default function ExerciseFormPanel({ library, setLibrary }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Push");

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      history: [],
    };

    setLibrary([...library, newExercise]);
    setName("");
    setType("Push");
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-4 w-full max-w-md mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <span>Add New Exercise</span>
      </h2>
      <form onSubmit={handleAddExercise} className="space-y-2">
        <input
          className="bg-gray-800 text-white border border-gray-700 p-1 w-full"
          type="text"
          placeholder="Exercise Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="bg-gray-800 text-white border border-gray-700 p-1 w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
        </select>
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

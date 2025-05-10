import { useState } from "react";

export default function ExerciseFormPanel({ library, setLibrary }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Push");
  const [targetSetsInput, setTargetSetsInput] = useState(3);

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newExercise = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      targetSets: targetSetsInput || 3,  // Default to 3 if blank
      history: [],
    };

    setLibrary([...library, newExercise]);
    setName("");
    setType("Push");
  };

  return (
    <div className="bg-zinc-900 text-white rounded-xl p-4 w-full max-w-md mx-auto mb-8">
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
        <select
          className="bg-zinc-800 text-white border border-gray-700 p-1 pl-2 w-full rounded-md"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
          <option value="Freestyle">Freestyle</option>
        </select>
        <input
          type="number"
          min="1"
          value={targetSetsInput}
          onChange={(e) => setTargetSetsInput(parseInt(e.target.value))}
          className="bg-zinc-800 text-white border border-gray-700 p-1 pl-2 w-full rounded-md"
          placeholder="Target Sets (default 3)"
        />
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

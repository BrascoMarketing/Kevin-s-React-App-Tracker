import { useState } from "react"; 
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function ExerciseLibraryColumns({ library, setLibrary }) {
  const handleDeleteExercise = (id) => {
    const updatedLibrary = library.filter((exercise) => exercise.id !== id);
    setLibrary(updatedLibrary);
  };

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) return; // Prevent cross-category moves

    const category = source.droppableId;
    const filtered = library.filter((ex) => ex.type === category);

    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const otherExercises = library.filter((ex) => ex.type !== category);

    setLibrary([...otherExercises, ...reordered]);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Push", "Pull", "Legs"].map((category) => (
          <div
            key={category}
            className="bg-gray-900 text-white rounded-xl shadow-md p-4"
          >
            <h3 className="text-lg font-bold mb-2">{category}</h3>
            <Droppable droppableId={category}>
              {(provided) => (
                <ul
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {library
                    .filter((ex) => ex.type === category)
                    .map((ex, index) => (
                      <Draggable key={ex.id} draggableId={ex.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-2 border border-gray-700 rounded flex justify-between items-center bg-gray-800 text-white shadow hover:bg-gray-700 transition-colors"
                            >
                            {editingId === ex.id ? (
                                <div className="flex items-center space-x-2 w-full">
                                <input
                                    className="bg-gray-700 text-white border border-gray-600 p-1 flex-1"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                />
                                <button
                                    onClick={() => {
                                    const updatedLibrary = library.map((item) =>
                                        item.id === ex.id ? { ...item, name: editValue } : item
                                    );
                                    setLibrary(updatedLibrary);
                                    setEditingId(null);
                                    setEditValue("");
                                    }}
                                    className="text-green-400"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                    setEditingId(null);
                                    setEditValue("");
                                    }}
                                    className="text-gray-400"
                                >
                                    Cancel
                                </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center w-full">
                                <span>⋮⋮ {ex.name}</span>
                                <div className="space-x-2">
                                    <button
                                    onClick={() => {
                                        setEditingId(ex.id);
                                        setEditValue(ex.name);
                                    }}
                                    className="text-yellow-400"
                                    >
                                    Edit
                                    </button>
                                    <button
                                    onClick={() => handleDeleteExercise(ex.id)}
                                    className="text-red-400"
                                    >
                                    Delete
                                    </button>
                                </div>
                                </div>
                            )}
                            </li>

                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

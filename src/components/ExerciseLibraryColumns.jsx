import { useState } from "react"; 
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { PencilIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/solid";
import { BookmarkSquareIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/solid";
import ExerciseEditModal from "./ExerciseEditModal";

export default function ExerciseLibraryColumns({ library, setLibrary }) {
  const handleDeleteExercise = (id) => {
    const updatedLibrary = library.filter((exercise) => exercise.id !== id);
    setLibrary(updatedLibrary);
  };

    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editTypes, setEditTypes] = useState([]);
    const [editTargetSets, setEditTargetSets] = useState(3);
    const [editUseBodyweight, setEditUseBodyweight] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [notification, setNotification] = useState("");

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) return; // Prevent cross-category moves

    const category = source.droppableId;
    const filtered = library.filter((ex) => ex.type.includes(category));

    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const otherExercises = library.filter((ex) => ex.type !== category);

    setLibrary([...otherExercises, ...reordered]);
  };    

  
  return (
    
    <>
    {notification && (
      <div className="fixed top-0 left-0 w-full bg-green-600 text-white text-center py-2 z-50 shadow-md">
        {notification}
      </div>
    )}

    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(JSON.parse(localStorage.getItem("exerciseCategories")) || []).map((cat) => {            
          return (
          <div key={cat.id}
            className="bg-zinc-900 text-white rounded-xl shadow-md p-4"
          >
            <h3 className="text-lg font-bold mb-2">{cat.name}</h3>
            <Droppable droppableId={cat.name}>
              {(provided) => {
                const filtered = library.filter((ex) => ex.type.includes(cat.name));

                return (
                  <ul
                    className="space-y-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {filtered.length === 0 ? (
                      <li className="text-gray-500">No exercises found.</li>
                    ) : (
                      filtered.map((ex, index) => (
                        <Draggable key={ex.id} draggableId={ex.id} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-2 border border-gray-700 rounded flex justify-between items-center bg-zinc-800 text-white shadow hover:bg-gray-700 transition-colors"
                            >
                              {editingId === ex.id ? (
                                <div className="flex items-center space-x-2 w-full">
                                  <input
                                    className="bg-gray-700 rounded-lg text-white border border-gray-600 p-1 pl-2 flex-1"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                  />
                                  <input
                                    type="number"
                                    min="1"
                                    value={editTargetSets}
                                    onChange={(e) => setEditTargetSets(parseInt(e.target.value))}
                                    className="bg-gray-700 rounded-lg text-white border border-gray-600 p-1 pl-2 w-10"
                                    placeholder="Sets"
                                  />
                                  <div className="flex flex-col space-y-1">
                                    {["Push", "Pull", "Legs", "Freestyle"].map((cat) => (
                                      <label key={cat} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={editTypes.includes(cat)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setEditTypes([...editTypes, cat]);
                                            } else {
                                              setEditTypes(editTypes.filter((t) => t !== cat));
                                            }
                                          }}
                                        />
                                        <span>{cat}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <label className="flex items-center space-x-2 mt-2">
                                    <input
                                      type="checkbox"
                                      checked={editUseBodyweight}
                                      onChange={(e) => setEditUseBodyweight(e.target.checked)}
                                    />
                                    <span>Use Bodyweight (No Weight Entry Needed)</span>
                                  </label>
                                  <button
                                    onClick={() => {
                                      const updatedLibrary = library.map((item) =>
                                        item.id === ex.id
                                          ? {
                                              ...item,
                                              name: editValue,
                                              type: editTypes,
                                              targetSets: editTargetSets,
                                              useBodyweight: editUseBodyweight,
                                            }
                                          : item
                                      );
                                      setLibrary(updatedLibrary);
                                      setEditingId(null);
                                      setEditValue("");
                                    }}
                                    className="text-green-400"
                                  >
                                    <BookmarkSquareIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditValue("");
                                    }}
                                    className="text-red-400"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center w-full">
                                  <span>⋮⋮&nbsp; {ex.name}</span>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => setEditingExercise(ex)}
                                      className="text-yellow-400 flex items-center space-x-1"
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExercise(ex.id)}
                                      className="text-red-400"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </ul>
                );
              }}
            </Droppable>

          </div> );
        })}
      </div>

        {editingExercise && (
          <ExerciseEditModal
            exercise={editingExercise}
            onClose={() => setEditingExercise(null)}
            onSave={(updatedExercise) => {
              const updatedLibrary = library.map((item) =>
                item.id === updatedExercise.id ? updatedExercise : item
              );
              setLibrary(updatedLibrary);

              setNotification(`${updatedExercise.name} updated successfully!`);

              // Auto-hide after 3 seconds
              setTimeout(() => setNotification(""), 3000);
            }
          }        
          />
        )}
    </DragDropContext>
    </>
  );
}

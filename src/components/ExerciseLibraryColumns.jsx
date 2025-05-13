import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { PencilIcon, TrashIcon, BookmarkSquareIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import ExerciseEditModal from "./ExerciseEditModal";

export default function ExerciseLibraryColumns({
  exercises,
  setExercises,
  categoryOrder,
  setCategoryOrder,
  exerciseCategories
}) {

  const [editingExercise, setEditingExercise] = useState(null);
  const [notification, setNotification] = useState("");

  // Handle deleting an exercise from all categories
  const handleDeleteExercise = (id) => {
    const updatedExercises = { ...exercises };
    delete updatedExercises[id];
    setExercises(updatedExercises);

    const updatedOrder = {};
    Object.keys(categoryOrder).forEach((cat) => {
      updatedOrder[cat] = categoryOrder[cat].filter((eid) => eid !== id);
    });
    setCategoryOrder(updatedOrder);
  };

  // Handle drag-and-drop reordering within a category
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) return;

    const category = source.droppableId;
    const reordered = Array.from(categoryOrder[category]);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setCategoryOrder({ ...categoryOrder, [category]: reordered });
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
    {Object.keys(categoryOrder)
      .filter((category) => category !== "Rest")
      .map((category) => (
        <div key={category} className="bg-zinc-900 text-white rounded-xl shadow-md p-4">
          <h3 className="text-lg font-bold mb-2">{category}</h3>
          <Droppable droppableId={category}>
            {(provided) => (
              <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                {(categoryOrder[category] || []).map((id, index) => {
                  const ex = exercises[id];
                  if (!ex) return null;

                  const isMultiCategory = ex.type.length > 1;
                  const isDraggable = !isMultiCategory;

                  const exerciseContent = (
                    <div className="flex justify-between items-center w-full">
                      <span>{ex.name}</span>
                      <div className="flex space-x-2">
                        {isMultiCategory && <LockClosedIcon className="h-4 w-4 text-yellow-400" />}
                        <button onClick={() => setEditingExercise(ex)} className="text-yellow-400">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteExercise(id)} className="text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );

                  return isDraggable ? (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 border border-gray-700 rounded bg-zinc-800 shadow hover:bg-gray-700 transition-colors w-full"
                        >
                          {exerciseContent}
                        </li>
                      )}
                    </Draggable>
                  ) : (
                    <li
                      key={id}
                      className="p-2 border border-gray-700 rounded bg-zinc-800 shadow w-full"
                    >
                      {exerciseContent}
                    </li>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
      ))}
  </div>
</DragDropContext>



      {editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise}
          setExercises={setExercises} 
          categoryOrder={categoryOrder}
          setCategoryOrder={setCategoryOrder}
          exerciseCategories={exerciseCategories}
          onClose={() => setEditingExercise(null)}
          onSave={(updatedExercise) => {
            setExercises((prev) => ({ ...prev, [updatedExercise.id]: updatedExercise }));
            setNotification(`${updatedExercise.name} updated successfully!`);
            setTimeout(() => setNotification(""), 3000);
          }}
        />
      )}
    </>
  );
}

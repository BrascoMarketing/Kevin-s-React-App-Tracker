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

// Handle soft or permanent delete
const handleDeleteExercise = (id) => {
  const exercise = exercises[id];
  if (!exercise) return;

  const isUnassigned = exercise.type.length === 1 && exercise.type[0] === "Unassigned";

  if (!isUnassigned) {
    // Move to Unassigned (soft delete)
    const updatedExercise = { ...exercise, type: ["Unassigned"] };
    setExercises({ ...exercises, [id]: updatedExercise });

    // Update categoryOrder: remove from all categories, add to Unassigned
    const updatedOrder = { ...categoryOrder };
    Object.keys(updatedOrder).forEach((cat) => {
      updatedOrder[cat] = updatedOrder[cat].filter((eid) => eid !== id);
    });
    if (!updatedOrder["Unassigned"]) {
      updatedOrder["Unassigned"] = [];
    }
    updatedOrder["Unassigned"].push(id);

    setCategoryOrder(updatedOrder);
    setNotification(`${exercise.name} moved to Unassigned.`);
    setTimeout(() => setNotification(""), 3000);
  } else {
    // Confirm permanent delete
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${exercise.name}" and all its data? This cannot be undone.`);
    if (!confirmed) return;

    // Fully remove from exercises and categoryOrder
    const updatedExercises = { ...exercises };
    delete updatedExercises[id];
    setExercises(updatedExercises);

    const updatedOrder = { ...categoryOrder };
    Object.keys(updatedOrder).forEach((cat) => {
      updatedOrder[cat] = updatedOrder[cat].filter((eid) => eid !== id);
    });
    setCategoryOrder(updatedOrder);

    setNotification(`${exercise.name} permanently deleted.`);
    setTimeout(() => setNotification(""), 3000);
  }
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
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
    {Object.keys(categoryOrder)
      .filter((category) => category !== "Rest")
      .map((category) => (
        <div key={category} className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
          <h3 className="text-white text-lg font-bold mb-2">{category}</h3>
          <Droppable droppableId={category}>
            {(provided) => (
              <ul className="relative space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                {(categoryOrder[category] || []).map((id, index) => {
                  const ex = exercises[id];
                  if (!ex) return null;

                  const isMultiCategory = ex.type.length > 1;
                  const isDraggable = !isMultiCategory;

                  const exerciseContent = (
                    <div className="flex text-white justify-between items-center w-full">
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
                          className="draggable flex p-2 border border-gray-700 rounded bg-zinc-800 shadow hover:bg-gray-700 transition-colors w-full"
                        >
                          <span className="text-white mr-2">⋮⋮ </span> {exerciseContent}
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

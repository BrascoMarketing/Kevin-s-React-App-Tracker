import { useState, useEffect } from "react";

export default function WeeklyScheduleBuilder({ setNotification, categories }) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Load saved schedule or default to Rest
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    const saved = localStorage.getItem("weeklySchedule");
    return saved
      ? JSON.parse(saved)
      : daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: "Rest" }), {});
  });

  // Save schedule to LocalStorage when updated
  useEffect(() => {
    localStorage.setItem("weeklySchedule", JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  const handleScheduleChange = (day, category) => {
    setWeeklySchedule((prev) => ({ ...prev, [day]: category }));
    setNotification(`${day} updated to "${category}"`);
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-4 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
      <ul className="space-y-2">
        {daysOfWeek.map((day) => (
          <li key={day} className="flex justify-between items-center">
            <span>{day}</span>
            <select
              value={weeklySchedule[day]}
              onChange={(e) => handleScheduleChange(day, e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 p-1 rounded"
            >
              <option value="Rest">Rest</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

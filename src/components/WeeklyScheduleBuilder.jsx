import { useState, useEffect } from "react";

export default function WeeklyScheduleBuilder({ exerciseCategories, setWeeklySchedule }) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const [schedule, setSchedule] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("weeklySchedule"));
    return saved || daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: "Rest" }), {});
  });

  useEffect(() => {
    localStorage.setItem("weeklySchedule", JSON.stringify(schedule));
    setWeeklySchedule(schedule);
  }, [schedule, setWeeklySchedule]);

  const handleChange = (day, value) => {
    setSchedule((prev) => ({ ...prev, [day]: value }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
      <h2 className="text-white text-xl font-bold mb-4">Weekly Schedule</h2>
      <ul className="text-white space-y-2">
        {daysOfWeek.map((day) => (
          <li key={day} className="flex justify-between items-center">
            <span>{day}</span>
            <select
              value={schedule[day]}
              onChange={(e) => handleChange(day, e.target.value)}
              className="bg-zinc-800 text-white border border-gray-600 p-1 rounded"
            >
              <option value="Rest">Rest</option>
              {exerciseCategories
                .filter((cat) => cat.name !== "Rest")
                .map((cat) => (
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

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPanel({ viewedDate, setViewedDate, logs }) {
  const loggedDates = [...new Set(logs.map(log => new Date(log.date).toDateString()))];

  // Days left to November 18, 2026 (based on the selected viewedDate)
  const targetDate = new Date('2026-11-18');
  const msLeft = targetDate - viewedDate;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4">        
      <div className="calendar-wrapper">
        <Calendar
          onChange={setViewedDate}
          value={viewedDate}
          calendarType="gregory"
          minDetail="month"
          className="!bg-gray-900 !text-white !border-none"
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;

            const isLogged = loggedDates.includes(date.toDateString());            

            return (
              <div className="flex justify-center items-center">
                {isLogged && <div className="indicator w-3 h-3 bg-blue-500 rounded-full"></div>}                
              </div>
            );
          }}
        />
      </div>

      {/* Creative countdown displayed directly below the calendar */}
      <div className="mt-0 text-center">        
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-2xl font-black text-gray-800 tracking-tighter">
            {daysLeft}
          </span>
          <span className="text-lg font-medium text-gray-800/70">days</span>
        </div>
      </div>
    </div>
  );
}
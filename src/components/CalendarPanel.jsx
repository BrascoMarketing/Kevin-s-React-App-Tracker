import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPanel({ viewedDate, setViewedDate, logs }) {
  const loggedDates = [...new Set(logs.map(log => new Date(log.date).toDateString()))];

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-4">      
      <div className="calendar-wrapper">
      <Calendar
        onChange={setViewedDate}
        value={viewedDate}
        calendarType="gregory"
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
    </div>
  );
}


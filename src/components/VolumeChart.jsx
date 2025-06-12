import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';
import { loadExerciseLogs } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const timeFrames = ["Week", "Month", "All-Time"];

export default function VolumeChart() {
  const [timeFrame, setTimeFrame] = useState("Week");
  const logs = loadExerciseLogs();

  // Filter logs based on selected time frame
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    const now = new Date();

    if (timeFrame === 'Week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return logDate >= sevenDaysAgo;
    } else if (timeFrame === 'Month') {
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    } else {
      return true; // All-Time
    }
  });

  // Calculate total volume for filtered logs
  const totalVolume = filteredLogs.reduce((sum, log) => {
    const logVolume = log.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0);
    return sum + logVolume;
  }, 0);

 // Build volume map by date for filtered logs
const volumeByDate = filteredLogs.reduce((acc, log) => {
  const date = new Date(log.date).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  }); // Formats as "6/12"
  const logVolume = log.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0);
  acc[date] = (acc[date] || 0) + logVolume;
  return acc;
}, {});

const sortedDates = Object.keys(volumeByDate).sort((a, b) => {
  // Sort by parsing "M/D" format
  const [monthA, dayA] = a.split("/");
  const [monthB, dayB] = b.split("/");
  return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
});

const data = {
  labels: sortedDates,
  datasets: [
    {
      label: "Total Volume (Reps × Weight)",
      data: sortedDates.map((date) => volumeByDate[date]),
      fill: false,
      borderColor: "#4ade80",
      tension: 0.3,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: { color: "#53607dcc" },
      ticks: {
        color: "#efefef",
        maxTicksLimit: 7,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      grid: { color: "#53607dcc" },
      ticks: { color: "#efefef" },
    },
  },
};

return (
  <div className="bg-gray-900 text-white rounded-xl p-4 space-y-4">
    <div className="flex justify-end items-center mb-2">
      <span className="text-sm text-green-400 font-bold">
        {totalVolume.toLocaleString()} lbs{" "}
        ({(totalVolume / 2000).toFixed(2).toLocaleString()} tons)
      </span>
    </div>

    <div className="flex space-x-2 mb-2">
      {timeFrames.map((frame) => (
        <button
          key={frame}
          onClick={() => setTimeFrame(frame)}
          className={`px-2 py-1 rounded ${
            timeFrame === frame ? "bg-blue-600" : "bg-gray-700"
          } hover:bg-blue-500`}
        >
          {frame}
        </button>
      ))}
    </div>

    <Line data={data} options={options} />
  </div>
);
}

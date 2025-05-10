import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';
import { loadExerciseLogs } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const timeFrames = ["Week", "Month", "All-Time"];

export default function VolumeChart() {
  const [timeFrame, setTimeFrame] = useState("Week");
  const logs = loadExerciseLogs();

  // Process logs into date-keyed volume map
  const volumeByDate = logs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString("en-US");
    const totalVolume = log.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
    acc[date] = (acc[date] || 0) + totalVolume;
    return acc;
  }, {});

  const sortedDates = Object.keys(volumeByDate).sort((a, b) => new Date(a) - new Date(b));

  let filteredDates = sortedDates;
  if (timeFrame === "Week") filteredDates = sortedDates.slice(-7);
  if (timeFrame === "Month") filteredDates = sortedDates.slice(-30);

  const data = {
    labels: filteredDates,
    datasets: [
      {
        label: 'Total Volume (Reps × Weight)',
        data: filteredDates.map(date => volumeByDate[date]),
        fill: false,
        borderColor: '#3B82F6',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false, text: 'Volume Over Time' },
    },
    scales: {
        x: {
            grid: {
                color: '#53607dcc'
            },
            ticks: {
                display: true,
                color: '#efefef',                              
            },
        },
        y: {
            grid: {
                color: '#53607dcc'
            },
            ticks: {
                display: true,
                color: '#efefef',                              
            },            
        }
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl shadow-md p-4 space-y-4">
        <h2 class="text-xl font-bold mb-4">Total Volume</h2>
      <div className="flex space-x-2 mb-2">        
        {timeFrames.map(frame => (
          <button
            key={frame}
            onClick={() => setTimeFrame(frame)}
            className={`px-2 py-1 rounded ${timeFrame === frame ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500`}
          >
            {frame}
          </button>
        ))}
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

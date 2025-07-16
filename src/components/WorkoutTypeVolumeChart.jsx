import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function WorkoutTypeVolumeChart({ logs, workoutType }) {
  // Filter logs by workout type only (no time frame filtering)
  const filteredLogs = logs.filter((log) => {
    return log.type === workoutType;
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
    const [monthA, dayA] = a.split("/");
    const [monthB, dayB] = b.split("/");
    return new Date(2025, monthA - 1, dayA) - new Date(2025, monthB - 1, dayB);
  });

  const data = {
    labels: sortedDates,
    datasets: [
      {
        label: `${workoutType} Volume (Reps × Weight)`,
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold">{workoutType} Volume</span>
        <span className="text-sm text-green-400 font-bold">
          {totalVolume.toLocaleString()} lbs{" "}
          ({(totalVolume / 2000).toFixed(2).toLocaleString()} tons)
        </span>
      </div>

      {/* Removed time frame buttons */}
      <Line data={data} options={options} />
    </div>
  );
}
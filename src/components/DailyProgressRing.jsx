import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

export default function DailyProgressRing({ targetSets, loggedSets }) {
  const progressRaw = targetSets > 0 ? (loggedSets / targetSets) * 100 : 0;
  const percentage = Math.min(progressRaw, 100);
  const isOverAchieved = progressRaw > 100;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [isOverAchieved ? '#f97316' : '#4ade80', '#3b82f6'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: { tooltip: { enabled: false } },
  };

  return (
    <div className={`relative w-48 h-48 block m-auto ${isOverAchieved ? 'animate-pulse' : ''}`}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-2xl font-bold">{Math.round(progressRaw)}%</span>
        <span className="text-sm">of expected sets</span>
      </div>
    </div>
  );
}

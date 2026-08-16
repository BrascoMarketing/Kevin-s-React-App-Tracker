import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(ArcElement, Tooltip);

export default function DailyProgressRing({ targetSets, loggedSets, exerciseLogs, viewedDate }) {
  const [dailyVolume, setDailyVolume] = useState(0);

  // Calculate daily volume from exerciseLogs
  useEffect(() => {
    const viewedKey = viewedDate.toDateString();
    const viewedLogs = exerciseLogs.filter(
      (log) => new Date(log.date).toDateString() === viewedKey
    );

    const totalVolume = viewedLogs.reduce((sum, log) => {
      return sum + log.sets.reduce((setSum, set) => setSum + (set.reps * set.weight || 0), 0);
    }, 0);

    setDailyVolume(totalVolume);
  }, [exerciseLogs, viewedDate]);

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

  // Calculate days left to November 18, 2026
  const today = new Date();
  const targetDate = new Date('2026-11-18');
  const msLeft = targetDate - today;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));

  return (
    <div className={`relative w-45 h-45 block m-auto`}>
      <Doughnut data={data} options={options} className={`${isOverAchieved ? 'animate-pulse' : ''}`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-5xl font-bold text-green-400">{Math.round(progressRaw)}%</span>
        <span className="text-sm">of expected sets</span>
        <div className="mt-8 text-center text-white">
          <span className="text-sm">Total Volume Today<br /></span>
          <span className="text-2xl font-semibold text-green-400">
             {dailyVolume > 0 ? `${dailyVolume.toLocaleString('en-US')} lbs` : 'No volume logged'}
          </span>
        </div>
        <div className="mt-8 text-center text-white">          
          <span className="block text-4xl font-bold text-green-400 mt-1">
            {daysLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
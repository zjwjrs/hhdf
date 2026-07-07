import React from 'react';
import { motion } from 'motion/react';
import { WeightLog, UserProfile, DailyStats } from '../types';
import { Activity, Target, Flame, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

interface StatsGridProps {
  logs: WeightLog[];
  profile: UserProfile;
}

export default function StatsGrid({ logs, profile }: StatsGridProps) {
  // Sort logs descending to find the latest
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const latestLog = sortedLogs[0];
  const secondLatestLog = sortedLogs[1];

  const currentWeight = latestLog ? latestLog.weight : profile.initialWeight;
  const initialWeight = profile.initialWeight;
  const targetWeight = profile.targetWeight;

  // 1. Calculate weight diff from previous day
  let weightChange = 0;
  if (latestLog && secondLatestLog) {
    weightChange = latestLog.weight - secondLatestLog.weight;
  } else if (latestLog) {
    weightChange = latestLog.weight - initialWeight;
  }

  // 2. BMI calculation
  const heightInM = profile.height / 100;
  const bmi = currentWeight / (heightInM * heightInM);
  
  let bmiCategory = "正常";
  let bmiColor = "text-emerald-500 bg-emerald-50";
  let bmiBorder = "border-emerald-100";
  
  if (bmi < 18.5) {
    bmiCategory = "体重过轻 (需要加强营养哦)";
    bmiColor = "text-sky-500 bg-sky-50";
    bmiBorder = "border-sky-100";
  } else if (bmi >= 24 && bmi < 28) {
    bmiCategory = "轻度超重 (可以适量控制饮食)";
    bmiColor = "text-amber-500 bg-amber-50";
    bmiBorder = "border-amber-100";
  } else if (bmi >= 28) {
    bmiCategory = "肥胖 (加油，健康减脂第一关)";
    bmiColor = "text-rose-500 bg-rose-50";
    bmiBorder = "border-rose-100";
  }

  // 3. Progress towards target
  // Percentage progress from initial weight to target weight
  let progressPercent = 0;
  const totalChangeNeeded = initialWeight - targetWeight;
  const changeAchieved = initialWeight - currentWeight;
  
  if (totalChangeNeeded > 0) {
    progressPercent = Math.min(100, Math.max(0, (changeAchieved / totalChangeNeeded) * 100));
  } else {
    // If target is higher or equal to initial, e.g. gaining weight
    const totalGainingNeeded = targetWeight - initialWeight;
    const gainAchieved = currentWeight - initialWeight;
    if (totalGainingNeeded > 0) {
      progressPercent = Math.min(100, Math.max(0, (gainAchieved / totalGainingNeeded) * 100));
    } else {
      progressPercent = 100;
    }
  }

  // 4. Calculate average weight
  const averageWeight = logs.length > 0 
    ? logs.reduce((sum, log) => sum + log.weight, 0) / logs.length 
    : currentWeight;

  // 5. Calculate streak (days logged consecutively starting from today/latest date)
  // Simple streak calculator
  const calculateStreak = (): number => {
    if (logs.length === 0) return 0;
    
    // Sort unique log dates ascending
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort();
    let streak = 0;
    let checkDate = new Date(2026, 6, 7); // July 7, 2026

    // Iterate backwards checking if each date exists
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        // Go back 1 day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today is not logged, but yesterday was, streak might still be active
        if (streak === 0 && dateStr === '2026-07-07') {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.includes(yesterdayStr)) {
            // Yes, streak is active from yesterday
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();
  const weightToTarget = currentWeight - targetWeight;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Current Weight Card */}
      <motion.div 
        id="current-weight-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-5 border border-rose-100/60 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 font-sans">当前体重</span>
          <div className="p-2 bg-rose-50/80 rounded-xl text-rose-500">
            <Activity size={16} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-sans text-gray-800 tracking-tight">
              {currentWeight.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-gray-400 font-sans">kg</span>
          </div>
          
          <div className="mt-2 flex items-center gap-1.5">
            {weightChange < 0 ? (
              <div className="flex items-center gap-0.5 text-emerald-600 text-xs font-medium font-sans bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingDown size={12} />
                <span>-{Math.abs(weightChange).toFixed(1)} kg</span>
              </div>
            ) : weightChange > 0 ? (
              <div className="flex items-center gap-0.5 text-rose-500 text-xs font-medium font-sans bg-rose-50 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} />
                <span>+{weightChange.toFixed(1)} kg</span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs font-medium font-sans bg-gray-50 px-2 py-0.5 rounded-full">持平</span>
            )}
            <span className="text-[10px] text-gray-400 font-sans">较上一次记录</span>
          </div>
        </div>
      </motion.div>

      {/* 2. BMI Card */}
      <motion.div 
        id="bmi-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-3xl p-5 border border-rose-100/60 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 font-sans">BMI 身体指数</span>
          <span className="text-[10px] text-gray-400 font-sans font-medium">身高: {profile.height}cm</span>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-sans text-gray-800 tracking-tight">
              {bmi.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-gray-400 font-sans">指数</span>
          </div>
          
          <div className="mt-2 flex">
            <span className={`text-[10px] font-bold font-sans px-2.5 py-0.5 rounded-full border ${bmiColor} ${bmiBorder}`}>
              {bmiCategory}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. Target Progress Card */}
      <motion.div 
        id="target-progress-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-3xl p-5 border border-rose-100/60 shadow-xs flex flex-col justify-between md:col-span-2"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 font-sans">目标进度</span>
            <span className="text-[10px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-md font-sans font-bold">
              目标: {targetWeight.toFixed(1)}kg
            </span>
          </div>
          <div className="p-1.5 bg-rose-50/80 rounded-xl text-rose-500">
            <Target size={15} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between w-full mb-1">
            <span className="text-xl font-black font-sans text-gray-800 tracking-tight">
              已完成 {progressPercent.toFixed(0)}%
            </span>
            <span className="text-xs font-bold font-sans text-rose-600">
              {weightToTarget <= 0 ? (
                <span className="flex items-center gap-0.5">
                  <Sparkles size={12} />
                  <span>已达成目标！恭喜静琳 🎉</span>
                </span>
              ) : (
                `还差 ${weightToTarget.toFixed(1)} kg`
              )}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-rose-50 rounded-full overflow-hidden mt-2 border border-rose-100/30">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
            />
          </div>

          <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400 font-sans">
            <span>初始: {initialWeight.toFixed(1)}kg</span>
            <span className="font-medium text-rose-400">持续加油！</span>
            <span>目标: {targetWeight.toFixed(1)}kg</span>
          </div>
        </div>
      </motion.div>

      {/* 4. Small Streak Badge and Average (Only shown on Desktop, stacked inside Bento dashboard) */}
      <div className="hidden">
        <div className="flex items-center gap-2">
          <Flame size={12} className="text-orange-500" />
          <span>连续记录: {streakDays}天</span>
        </div>
        <span>平均体重: {averageWeight.toFixed(1)}kg</span>
      </div>
    </div>
  );
}

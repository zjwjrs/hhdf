import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WeightLog, UserProfile } from './types';
import StatsGrid from './components/StatsGrid';
import CalendarGrid from './components/CalendarGrid';
import WeightChart from './components/WeightChart';
import LogsList from './components/LogsList';
import LogModal from './components/LogModal';
import ProfileSettings from './components/ProfileSettings';
import { Heart, Sparkles, Plus, Scale, Compass, Settings, HelpCircle, Moon } from 'lucide-react';

const SEED_PROFILE: UserProfile = {
  name: "陈静琳",
  height: 162,
  targetWeight: 50.0,
  initialWeight: 54.5
};

const SEED_LOGS: WeightLog[] = [
  { id: "2026-06-24", date: "2026-06-24", weight: 54.5, mood: "😊", notes: "开启体重打卡第一天！加油，小静琳！💪", time: "08:15", createdAt: 1782298500000 },
  { id: "2026-06-25", date: "2026-06-25", weight: 54.2, mood: "🤩", notes: "首日轻了0.3kg！今天晚上慢跑半小时，少吃多动！", time: "08:00", createdAt: 1782384000000 },
  { id: "2026-06-26", date: "2026-06-26", weight: 54.3, mood: "😐", notes: "稍微回弹了一点，不气馁，健康减脂，心态最重要。", time: "08:20", createdAt: 1782470400000 },
  { id: "2026-06-27", date: "2026-06-27", weight: 53.9, mood: "😊", notes: "哇！突破54的大关了！开心，低碳饮食见效了。", time: "07:55", createdAt: 1782556800000 },
  { id: "2026-06-28", date: "2026-06-28", weight: 53.6, mood: "😴", notes: "睡眠不太足，今早量又轻了一点点，今天要注意早点休息。", time: "08:10", createdAt: 1782643200000 },
  { id: "2026-06-29", date: "2026-06-29", weight: 53.8, mood: "🍕", notes: "聚餐吃了点甜品，体重稍稍上涨，晚上安排帕梅拉还债！", time: "08:30", createdAt: 1782729600000 },
  { id: "2026-06-30", date: "2026-06-30", weight: 53.4, mood: "🔥", notes: "暴汗锻炼太爽了，体重重新回落！水分和脂肪都在走低。", time: "08:05", createdAt: 1782816000000 },
  { id: "2026-07-01", date: "2026-07-01", weight: 53.1, mood: "😊", notes: "七月你好！新的一个月，目标突破50kg，静琳冲鸭！", time: "08:00", createdAt: 1782902400000 },
  { id: "2026-07-02", date: "2026-07-02", weight: 52.9, mood: "🤩", notes: "历史性时刻！挺进52kg开头，太让人激动了！✨", time: "07:45", createdAt: 1782988800000 },
  { id: "2026-07-03", date: "2026-07-03", weight: 52.7, mood: "💪", notes: "保持中！晚餐只喝了鸡胸肉番茄汤加糙米饭，饱腹感满满。", time: "08:00", createdAt: 1783075200000 },
  { id: "2026-07-04", date: "2026-07-04", weight: 52.8, mood: "😐", notes: "周末有一点松懈，没关系，少餐多水，继续出发。", time: "08:35", createdAt: 1783161600000 },
  { id: "2026-07-05", date: "2026-07-05", weight: 52.4, mood: "😊", notes: "掉了0.4kg！大跨步，看来帕梅拉真的超级燃脂！", time: "08:10", createdAt: 1783248000000 },
  { id: "2026-07-06", date: "2026-07-06", weight: 52.2, mood: "🔥", notes: "线条变明显了，下颌线也清晰了好多，静琳太棒了。", time: "08:00", createdAt: 1783334400000 },
  { id: "2026-07-07", date: "2026-07-07", weight: 52.1, mood: "😊", notes: "早晨空腹记录52.1kg，神清气爽！距离目标50kg只有一步之遥！✨", time: "07:30", createdAt: 1783420800000 }
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(SEED_PROFILE);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal / Interaction states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('chen_jinglin_profile');
      const storedLogs = localStorage.getItem('chen_jinglin_logs');

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        localStorage.setItem('chen_jinglin_profile', JSON.stringify(SEED_PROFILE));
      }

      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      } else {
        setLogs(SEED_LOGS);
        localStorage.setItem('chen_jinglin_logs', JSON.stringify(SEED_LOGS));
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      setLogs(SEED_LOGS);
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  const saveLogsToStorage = (updatedLogs: WeightLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('chen_jinglin_logs', JSON.stringify(updatedLogs));
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('chen_jinglin_profile', JSON.stringify(updatedProfile));
  };

  // Log handlers
  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSaveLog = (newLog: WeightLog) => {
    const existingIndex = logs.findIndex(log => log.date === newLog.date);
    let updatedLogs = [...logs];

    if (existingIndex > -1) {
      updatedLogs[existingIndex] = newLog;
    } else {
      updatedLogs.push(newLog);
    }

    saveLogsToStorage(updatedLogs);
  };

  const handleDeleteLog = (id: string) => {
    const updatedLogs = logs.filter(log => log.id !== id);
    saveLogsToStorage(updatedLogs);
  };

  const handleLogToday = () => {
    const todayStr = '2026-07-07'; // Fixed current local date in metadata
    setSelectedDate(todayStr);
    setIsModalOpen(true);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-gray-500 font-bold">载入中，陈静琳的体重空间...</p>
      </div>
    );
  }

  // Find if a record exists for the selected date
  const selectedLog = logs.find(log => log.date === selectedDate);

  return (
    <div className="min-h-screen bg-[#FDF9FA] text-gray-800 pb-16 antialiased">
      {/* 1. Global Navigation / Brand Header */}
      <header className="bg-white border-b border-rose-100/40 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-rose-400 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Scale size={18} />
            </div>
            <div>
              <h1 className="font-sans font-black text-gray-800 tracking-tight text-sm leading-none">
                陈静琳的每日体重记录
              </h1>
              <p className="text-[9px] text-rose-500 font-bold mt-1 tracking-wider uppercase">
                Happy & Healthy Weight Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="log-today-btn"
              onClick={handleLogToday}
              className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white font-sans font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>记录今日</span>
            </button>

            <button
              id="toggle-settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-xl border transition-all ${
                showSettings 
                  ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                  : 'bg-white border-gray-100 text-gray-500 hover:text-gray-800 hover:border-gray-200'
              }`}
              title="应用参数与源码导出"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Stage */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        <StatsGrid logs={logs} profile={profile} />

        {/* Collapsible / Floating Profile Settings & Android Export Card */}
        {showSettings && (
          <motion.div 
            id="settings-panel-container"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            className="overflow-hidden"
          >
            <ProfileSettings 
              profile={profile} 
              logs={logs} 
              onSaveProfile={handleSaveProfile} 
            />
          </motion.div>
        )}

        {/* Bento Dashboard Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Main Weight Grid - Bento left col (span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <CalendarGrid logs={logs} onDayClick={handleDayClick} />
          </div>

          {/* Metrics Trend Chart & History - Bento right col (span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <WeightChart logs={logs} />
            
            <LogsList 
              logs={logs} 
              onEdit={(log) => handleDayClick(log.date)} 
              onDelete={handleDeleteLog} 
            />
          </div>
        </div>
      </main>

      {/* 3. Log Overlay Modal */}
      <LogModal
        isOpen={isModalOpen}
        dateStr={selectedDate}
        existingLog={selectedLog}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        onDelete={handleDeleteLog}
      />

      {/* Decorative footer */}
      <footer className="text-center py-12 text-[10px] text-gray-400 font-sans mt-8 select-none border-t border-rose-50/50">
        <p className="flex items-center justify-center gap-1">
          <span>陈静琳专属体重管家 · 每天离更美好的自己近一点</span>
          <Heart size={10} className="fill-rose-300 text-rose-300" />
        </p>
        <p className="mt-1 opacity-70">
          Android Studio (Compose M3) 原生工程编译包现已在右上角【设置】中提供极速下载
        </p>
      </footer>
    </div>
  );
}

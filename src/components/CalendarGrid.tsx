import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WeightLog } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarGridProps {
  logs: WeightLog[];
  onDayClick: (dateStr: string) => void;
}

export default function CalendarGrid({ logs, onDayClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 7)); // July 7, 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month name display in Chinese
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

  // Build grid items
  const gridCells = [];
  
  // Empty slots for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push({ type: 'empty', id: `empty-${i}` });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    
    // Find log for this date
    const dayLog = logs.find(log => log.date === dateStr);
    
    gridCells.push({
      type: 'day',
      day,
      dateStr,
      log: dayLog,
      id: dateStr
    });
  }

  // Helper to calculate weight diff compared to the most recent previous record
  const getWeightStatus = (currentLog: WeightLog) => {
    // Sort all logs prior to this date descending
    const pastLogs = logs
      .filter(l => l.date < currentLog.date)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (pastLogs.length === 0) return 'neutral';
    
    const diff = currentLog.weight - pastLogs[0].weight;
    if (diff < -0.1) return 'down'; // Weight decreased! Green indicator
    if (diff > 0.1) return 'up';   // Weight increased! Rose/Orange indicator
    return 'neutral';
  };

  return (
    <div id="calendar-bento-card" className="bg-white rounded-3xl p-6 shadow-xs border border-rose-100/60 transition-all">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
            <CalendarIcon size={18} id="calendar-icon" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-gray-800 tracking-tight text-base">日历体重宫格</h3>
            <p className="text-[11px] text-gray-400 font-sans">点击任意宫格即可记录或查看当天体重</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl">
          <button 
            id="prev-month-btn"
            onClick={prevMonth} 
            className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-800 hover:shadow-xs transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-gray-700 px-2 min-w-[70px] text-center font-sans">
            {year}年 {monthNames[month]}
          </span>
          <button 
            id="next-month-btn"
            onClick={nextMonth} 
            className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-800 hover:shadow-xs transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, idx) => (
          <div 
            key={`header-${idx}`} 
            className={`text-center text-[11px] font-bold py-1 select-none font-sans ${
              idx === 0 || idx === 6 ? 'text-rose-300' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Cells Grid */}
      <div className="grid grid-cols-7 gap-2">
        {gridCells.map((cell, idx) => {
          if (cell.type === 'empty') {
            return (
              <div 
                key={cell.id} 
                className="aspect-square bg-gray-50/30 rounded-2xl border border-transparent select-none"
              />
            );
          }

          const { day, dateStr, log } = cell as { day: number; dateStr: string; log: WeightLog | undefined };
          const isToday = dateStr === '2026-07-07'; // Match metadata date
          
          let status = 'neutral';
          if (log) {
            status = getWeightStatus(log);
          }

          return (
            <motion.button
              key={cell.id}
              id={`calendar-day-btn-${day}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDayClick(dateStr)}
              className={`relative aspect-square rounded-2xl flex flex-col justify-between p-1.5 transition-all outline-none border text-left ${
                log 
                  ? 'bg-rose-50/60 hover:bg-rose-50 border-rose-100/60 hover:border-rose-200' 
                  : 'bg-gray-50/50 hover:bg-gray-100/50 border-gray-100/30 hover:border-gray-200'
              } ${isToday ? 'ring-2 ring-rose-400 ring-offset-2' : ''}`}
            >
              {/* Day Number */}
              <span className={`text-[11px] font-bold font-sans ${
                log ? 'text-rose-500' : 'text-gray-400'
              } ${isToday ? 'text-rose-600 font-extrabold' : ''}`}>
                {day}
                {isToday && <span className="text-[9px] font-normal ml-0.5 opacity-85">(今)</span>}
              </span>

              {/* Day Weight Value */}
              {log ? (
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs font-black font-sans text-rose-700 tracking-tight">
                      {log.weight.toFixed(1)}
                    </span>
                    <span className="text-[8px] text-rose-400 font-sans">kg</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs select-none">{log.mood}</span>
                    {status === 'down' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="比上次下降" />
                    )}
                    {status === 'up' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="比上次上升" />
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 self-center mb-1 font-sans font-medium">
                  +
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-50 text-[11px] text-gray-400 font-sans">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-100 border border-rose-200" />
          <span>已记录体重</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>体重减轻 (进步)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>体重增加</span>
        </div>
      </div>
    </div>
  );
}

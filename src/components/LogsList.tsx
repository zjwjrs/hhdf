import React, { useState } from 'react';
import { WeightLog } from '../types';
import { Search, Edit, Trash2, Calendar, MessageSquare, Flame } from 'lucide-react';

interface LogsListProps {
  logs: WeightLog[];
  onEdit: (log: WeightLog) => void;
  onDelete: (id: string) => void;
}

export default function LogsList({ logs, onEdit, onDelete }: LogsListProps) {
  const [search, setSearch] = useState('');

  // Sort logs: newest first
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const filteredLogs = sortedLogs.filter(log => {
    const term = search.toLowerCase();
    return log.date.includes(term) || log.notes.toLowerCase().includes(term) || log.mood.includes(term);
  });

  const handleDelete = (id: string) => {
    if (confirm('确认删除这一天的体重数据吗？此操作不可逆！')) {
      onDelete(id);
    }
  };

  return (
    <div id="logs-timeline-card" className="bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs space-y-5">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="font-sans font-bold text-gray-800 text-base">历史体重列表</h3>
          <p className="text-[11px] text-gray-400 font-sans">检索历史、总结体重变化的复盘天地</p>
        </div>

        <div className="relative">
          <input
            id="search-input-field"
            type="text"
            placeholder="搜索日期、心情或备注..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-xl text-xs font-sans text-gray-700 outline-none transition-all placeholder-gray-400"
          />
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Logs list */}
      {filteredLogs.length === 0 ? (
        <div className="h-44 border border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-xs font-sans">
          <span>没有搜索到对应的记录 🌸</span>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              id={`log-item-${log.id}`}
              className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-rose-50/20 border border-gray-100/30 hover:border-rose-100/30 rounded-2xl transition-all"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Mood circle */}
                <div className="w-11 h-11 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-xl shadow-xs shrink-0 select-none">
                  {log.mood}
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-sans text-gray-700">
                      {log.date}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans font-medium flex items-center gap-0.5">
                      <Calendar size={10} />
                      {log.time}
                    </span>
                  </div>
                  
                  {log.notes ? (
                    <p className="text-[11px] text-gray-500 font-sans leading-relaxed truncate max-w-xs sm:max-w-md flex items-start gap-1">
                      <MessageSquare size={10} className="text-gray-400 mt-0.5 shrink-0" />
                      <span>{log.notes}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-300 font-sans italic">没有留下备注碎碎念~</p>
                  )}
                </div>
              </div>

              {/* Weight & Action Panel */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right leading-none">
                  <div className="flex items-baseline justify-end gap-0.5">
                    <span className="text-xl font-black font-sans text-gray-800 tracking-tight">
                      {log.weight.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 font-sans">kg</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`edit-log-btn-${log.id}`}
                    onClick={() => onEdit(log)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-white rounded-xl border border-transparent hover:border-rose-100/50 transition-all"
                    title="修改此条"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    id={`delete-log-btn-${log.id}`}
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl border border-transparent hover:border-red-100/50 transition-all"
                    title="删除此条"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

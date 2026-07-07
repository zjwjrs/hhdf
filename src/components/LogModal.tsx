import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WeightLog } from '../types';
import { X, Calendar, Flame, Smile, PenTool, Check, Trash2, Clock } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  dateStr: string;
  existingLog?: WeightLog;
  onClose: () => void;
  onSave: (log: WeightLog) => void;
  onDelete?: (id: string) => void;
}

export default function LogModal({
  isOpen,
  dateStr,
  existingLog,
  onClose,
  onSave,
  onDelete
}: LogModalProps) {
  const [weight, setWeight] = useState<string>('');
  const [mood, setMood] = useState<string>('😊');
  const [notes, setNotes] = useState<string>('');
  const [time, setTime] = useState<string>('08:30');

  const moodOptions = [
    { emoji: '😊', label: '开心' },
    { emoji: '🤩', label: '激动' },
    { emoji: '😐', label: '平静' },
    { emoji: '😴', label: '困倦' },
    { emoji: '🍕', label: '吃货' },
    { emoji: '🔥', label: '活力' },
    { emoji: '😢', label: '郁闷' },
    { emoji: '💪', label: '坚持' }
  ];

  // Initialize fields on load/change
  useEffect(() => {
    if (existingLog) {
      setWeight(existingLog.weight.toString());
      setMood(existingLog.mood);
      setNotes(existingLog.notes);
      setTime(existingLog.time);
    } else {
      // Default values for new records
      setWeight('50.0');
      setMood('😊');
      setNotes('');
      
      // Fetch current time
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
    }
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert('请输入有效的体重数值（大于 0 的数字）');
      return;
    }

    onSave({
      id: dateStr,
      date: dateStr,
      weight: weightNum,
      mood,
      notes,
      time,
      createdAt: existingLog?.createdAt || Date.now()
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && existingLog) {
      if (confirm('确定要删除这天的体重记录吗？此操作不可撤销哦！')) {
        onDelete(existingLog.id);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          id="log-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-rose-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-gradient-to-r from-rose-50/50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500 rounded-lg text-white">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-gray-800 text-sm">
                  {existingLog ? '修改体重记录' : '新增体重记录'}
                </h3>
                <p className="text-[10px] text-rose-500 font-sans font-bold mt-0.5">
                  日期: {dateStr}
                </p>
              </div>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* 1. Weight Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 font-sans block">当前体重 (kg)</label>
              <div className="relative flex items-center">
                <input
                  id="weight-input-field"
                  type="number"
                  step="0.01"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="50.0"
                  className="w-full pl-4 pr-16 py-3.5 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-2xl text-xl font-black font-sans text-gray-800 focus:ring-1 focus:ring-rose-200 transition-all outline-none"
                />
                <span className="absolute right-4 text-xs font-bold text-gray-400 font-sans">
                  公斤 (kg)
                </span>
              </div>
            </div>

            {/* 2. Recording Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 font-sans flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                <span>记录时间</span>
              </label>
              <input
                id="time-input-field"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-xl text-sm font-sans text-gray-700 outline-none transition-all"
              />
            </div>

            {/* 3. Mood Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 font-sans flex items-center gap-1">
                <Smile size={12} className="text-gray-400" />
                <span>今日心情</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.emoji}
                    id={`mood-btn-${opt.emoji}`}
                    type="button"
                    onClick={() => setMood(opt.emoji)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      mood === opt.emoji
                        ? 'bg-rose-50 border-rose-300 scale-[1.03] shadow-xs'
                        : 'bg-gray-50/50 hover:bg-gray-50 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl select-none">{opt.emoji}</span>
                    <span className={`text-[9px] font-sans font-semibold mt-1 ${
                      mood === opt.emoji ? 'text-rose-600' : 'text-gray-400'
                    }`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Notes Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 font-sans flex items-center gap-1">
                <PenTool size={12} className="text-gray-400" />
                <span>备注碎碎念</span>
              </label>
              <textarea
                id="notes-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="今天运动了吗？有没有好好控制卡路里？快记下来鼓励一下自己吧！✨"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-2xl text-xs font-sans text-gray-700 leading-relaxed outline-none transition-all resize-none placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-3">
              {existingLog ? (
                <button
                  id="delete-log-btn"
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-xl transition-colors text-xs font-bold font-sans"
                >
                  <Trash2 size={13} />
                  <span>删除</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  id="cancel-modal-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-sans"
                >
                  取消
                </button>
                <button
                  id="submit-log-btn"
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-sans font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all"
                >
                  <Check size={14} />
                  <span>保存记录</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

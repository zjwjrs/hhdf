import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, WeightLog } from '../types';
import { generateAndroidProjectZip } from '../utils/androidProjectGenerator';
import { 
  User, 
  Target, 
  Settings, 
  Download, 
  Heart, 
  Sparkles, 
  Smartphone, 
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  logs: WeightLog[];
  onSaveProfile: (profile: UserProfile) => void;
}

export default function ProfileSettings({ profile, logs, onSaveProfile }: ProfileSettingsProps) {
  const [height, setHeight] = useState<string>(profile.height.toString());
  const [targetWeight, setTargetWeight] = useState<string>(profile.targetWeight.toString());
  const [initialWeight, setInitialWeight] = useState<string>(profile.initialWeight.toString());
  const [name, setName] = useState<string>(profile.name);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hVal = parseFloat(height);
    const twVal = parseFloat(targetWeight);
    const iwVal = parseFloat(initialWeight);

    if (isNaN(hVal) || isNaN(twVal) || isNaN(iwVal) || hVal <= 0 || twVal <= 0 || iwVal <= 0) {
      alert('请填入正确的数值！');
      return;
    }

    onSaveProfile({
      name,
      height: hVal,
      targetWeight: twVal,
      initialWeight: iwVal
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadAndroidProject = async () => {
    setZipLoading(true);
    setZipSuccess(false);
    try {
      // Package the ZIP with current weight logs and profile settings pre-seeded
      const zipBlob = await generateAndroidProjectZip(logs, {
        name,
        height: parseFloat(height) || profile.height,
        targetWeight: parseFloat(targetWeight) || profile.targetWeight,
        initialWeight: parseFloat(initialWeight) || profile.initialWeight
      });

      // Download file in browser
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `陈静琳的每日体重记录_Android工程源码.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('生成 Android 源码压缩包失败，请重试！');
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-3xl p-6 text-white shadow-xs relative overflow-hidden border border-rose-400/30">
        {/* Abstract background decorative patterns */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl" />
        <div className="absolute right-12 top-2 w-24 h-24 bg-white/10 rounded-full blur-lg" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold font-sans w-fit">
              <Sparkles size={11} />
              <span>专属定制 · 快乐纤体</span>
            </div>
            <h2 className="text-xl font-black font-sans tracking-tight">陈静琳，今天也是精致的一天 ✨</h2>
            <p className="text-xs text-rose-50/90 leading-relaxed font-sans max-w-sm">
              三分练七分吃，体重只是数字。保持好心情，相信自己的身体，坚持记录终有满满惊喜哦！💖
            </p>
          </div>
          <div className="text-4xl">🌸</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column: Parameters settings (Forms) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs h-fit space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-gray-800 text-sm">参数设置</h3>
              <p className="text-[10px] text-gray-400 font-sans">配置您的身材数值，计算最精准的BMI</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 font-sans block">记录对象</label>
              <input
                id="profile-name-field"
                type="text"
                disabled
                value={name}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 font-sans cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 font-sans block">当前身高 (cm)</label>
              <input
                id="profile-height-field"
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="162"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-xl text-xs font-bold font-sans text-gray-700 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 font-sans block">初始体重 (kg)</label>
                <input
                  id="profile-initial-weight-field"
                  type="number"
                  step="0.1"
                  required
                  value={initialWeight}
                  onChange={(e) => setInitialWeight(e.target.value)}
                  placeholder="55.0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-xl text-xs font-bold font-sans text-gray-700 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 font-sans block">目标体重 (kg)</label>
                <input
                  id="profile-target-weight-field"
                  type="number"
                  step="0.1"
                  required
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="50.0"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 focus:border-rose-300 focus:bg-white rounded-xl text-xs font-bold font-sans text-gray-700 outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold font-sans rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Heart size={14} className="fill-white" />
              <span>保存身材参数</span>
            </button>

            {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-emerald-600 bg-emerald-50 py-2 px-3 rounded-lg flex items-center gap-1.5 border border-emerald-100 font-sans font-semibold"
              >
                <CheckCircle2 size={13} />
                <span>更新成功！BMI及目标进度已同步刷新。</span>
              </motion.div>
            )}
          </form>
        </div>

        {/* Right column: Android App export download launcher card */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-rose-100/60 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                <Smartphone size={16} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-gray-800 text-sm">打包 Android App 安卓工程</h3>
                <p className="text-[10px] text-gray-400 font-sans">一键将网页内容打包为可在 Android Studio 完美运行的工程 ZIP</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-600 font-sans leading-relaxed">
                我们为静琳专属编写了一套<strong>高纯度原生 Jetpack Compose (Kotlin) 安卓工程源码</strong>。
                点击下方按钮，系统将把您在<strong>网页上记录的所有体重数据</strong>和<strong>身材设置参数</strong>自动缝合/写入，打包成一键运行的工程。
              </p>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-2.5">
                <h4 className="text-xs font-bold text-gray-700 font-sans flex items-center gap-1">
                  <FileCheck2 size={13} className="text-rose-500" />
                  <span>安卓应用独家亮点：</span>
                </h4>
                <ul className="text-[11px] text-gray-500 space-y-1.5 font-sans pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span><strong>日历宫格布局</strong>：完全复刻网页端核心功能，一目了然极速响应</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span><strong>无网络本地化</strong>：内置 SharedPreferences 本地轻量数据存储，守护隐私</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span><strong>原生 Canvas 折线图</strong>：零外部依赖，极致流畅展示减重抛物线</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">•</span>
                    <span><strong>零报错架构</strong>：使用 Google 最新 Jetpack Compose M3 & gradle 配置，开箱即运行</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="download-android-project-btn"
              onClick={handleDownloadAndroidProject}
              disabled={zipLoading}
              className={`w-full py-3.5 rounded-2xl font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                zipLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-800 to-gray-950 hover:from-rose-500 hover:to-rose-600 hover:shadow-md text-white active:scale-95'
              }`}
            >
              {zipLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span>正在缝合数据并压缩工程源码...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>一键打包下载 Android Studio 完整工程 ZIP</span>
                </>
              )}
            </button>

            {zipSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-emerald-600 bg-emerald-50 py-2.5 px-4 rounded-xl flex items-center gap-2 border border-emerald-100 font-sans font-bold mt-3"
              >
                <CheckCircle2 size={14} />
                <span>工程打包成功！请查看本地下载文件夹，解压后即可在 Android Studio 中打开运行。</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

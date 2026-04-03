import { useState, useEffect, useCallback } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import client from '../api/client';
import toast from 'react-hot-toast';

function CalendarGrid({ completionMap }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-first
  const today = new Date().toISOString().split('T')[0];

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline font-bold text-xl text-primary">Monthly Rhythm</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-on-surface-variant">{monthName}</span>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {DAY_LABELS.map(d => (
          <span key={d} className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isDone = completionMap[dateStr] > 0;
          return (
            <div key={dateStr} className="py-1 flex flex-col items-center justify-center relative">
              <span className={`text-sm font-bold z-10 w-8 h-8 flex items-center justify-center rounded-xl transition-all
                ${isToday ? 'bg-primary text-on-primary' : isDone ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'}`}>
                {day}
              </span>
              {isDone && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function History() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await client.get('/habits/history');
      setData(res.data);
    } catch {
      toast.error('Failed to load history');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );

  const { completionMap = {}, weekPerf = [], currentStreak = 0, bestStreak = 0, achievements = [] } = data || {};
  const maxPct = Math.max(...weekPerf.map(d => d.pct), 1);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <TopBar title="History & Growth" />
      <main className="pt-24 pb-36 px-6 max-w-4xl mx-auto">

        <header className="mb-10">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight mb-2">History & Growth</h1>
          <p className="text-on-surface-variant font-medium">Tracking your journey through time.</p>
        </header>

        {/* Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <CalendarGrid completionMap={completionMap} />

          {/* Momentum Card */}
          <section className="md:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="z-10">
              <h2 className="font-headline font-bold text-xl mb-1">Momentum</h2>
              <p className="opacity-80 text-sm">Active Streak</p>
            </div>
            <div className="z-10 py-4">
              <span className="font-headline text-6xl font-extrabold tracking-tighter">{currentStreak}</span>
              <span className="text-lg font-bold ml-1 opacity-80">Days</span>
            </div>
            <div className="z-10 bg-white/10 backdrop-blur-md rounded-lg p-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                <span>Best: {bestStreak}</span>
                <span>Current: {currentStreak}</span>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-fixed-dim rounded-full transition-all duration-700" style={{ width: bestStreak > 0 ? `${(currentStreak / bestStreak) * 100}%` : '0%' }} />
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-20 transform rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
          </section>

          {/* Weekly Bar Chart */}
          <section className="md:col-span-12 bg-surface-container-low rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="font-headline font-bold text-2xl text-primary mb-2">Weekly Performance</h2>
                {weekPerf.length > 1 && (
                  <p className="text-on-surface-variant text-sm max-w-md">
                    {weekPerf[weekPerf.length - 1]?.pct >= weekPerf[weekPerf.length - 2]?.pct
                      ? <span>Your habit completion is <span className="text-secondary font-bold">improving</span> — great work!</span>
                      : <span>Keep pushing — consistency is the key to momentum.</span>}
                  </p>
                )}
              </div>
              <div className="flex items-end gap-3 md:gap-6 h-40">
                {weekPerf.map((day, i) => {
                  const isToday = i === weekPerf.length - 1;
                  const heightPct = maxPct > 0 ? (day.pct / maxPct) * 100 : 0;
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant">{day.pct}%</span>
                      <div className={`w-8 md:w-12 bg-surface-container-highest rounded-full flex flex-col justify-end h-32 ${isToday ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-container-low' : ''}`}>
                        <div
                          className={`w-full rounded-full transition-all duration-700 ${isToday ? 'bg-primary-container' : day.pct >= 80 ? 'bg-secondary' : 'bg-primary'}`}
                          style={{ height: `${Math.max(heightPct, 4)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-2xl text-primary">Hall of Impact</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {achievements.map(a => (
              <div
                key={a.id}
                className={`min-w-[160px] p-5 rounded-2xl flex flex-col items-center text-center group transition-colors duration-300 ${a.locked ? 'bg-surface-container opacity-60' : 'bg-surface-container-lowest hover:bg-white'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform
                  ${a.locked ? 'bg-surface-container-highest text-on-surface-variant'
                    : a.color === 'secondary' ? 'bg-secondary-container text-on-secondary-container'
                    : a.color === 'tertiary' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                    : 'bg-primary-fixed text-primary'}`}>
                  <span className="material-symbols-outlined text-[32px]" style={a.locked ? {} : { fontVariationSettings: "'FILL' 1" }}>
                    {a.locked ? 'lock' : a.icon}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{a.name}</h3>
                <p className="text-[10px] text-on-surface-variant leading-tight">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}

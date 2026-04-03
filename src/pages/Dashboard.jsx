import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import client from '../api/client';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  mindfulness: 'self_improvement',
  health: 'water_drop',
  focus: 'bolt',
  fitness: 'directions_run',
  learning: 'menu_book',
  other: 'star',
};
const CATEGORY_COLORS = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  tertiary: 'border-tertiary',
};

function AddHabitModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', icon: 'bolt', category: 'focus', color: 'primary' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter a habit name'); return; }
    setLoading(true);
    try {
      const { data } = await client.post('/habits', form);
      toast.success('Habit created!');
      onCreated(data);
      onClose();
    } catch {
      toast.error('Failed to create habit');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-2xl text-primary">New Habit</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface btn-spring">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Habit Name</label>
            <input
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning Meditation"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-headline"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
            <input
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="15 min mindfulness"
              className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-headline"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
              <select
                value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, icon: CATEGORY_ICONS[e.target.value] || 'bolt' }))}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-headline"
              >
                {Object.keys(CATEGORY_ICONS).map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Color</label>
              <select
                value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-headline"
              >
                <option value="primary">Indigo</option>
                <option value="secondary">Green</option>
                <option value="tertiary">Amber</option>
              </select>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Creating…' : <><span className="material-symbols-outlined">add</span> Create Habit</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      const { data } = await client.get('/habits');
      setHabits(data);
    } catch {
      toast.error('Failed to load habits');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const toggleComplete = async (habit) => {
    try {
      const { data } = await client.put(`/habits/${habit._id}/complete`);
      setHabits(prev => prev.map(h => h._id === data._id ? data : h));
    } catch { toast.error('Failed to update habit'); }
  };

  const deleteHabit = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your habits? This can't be undone.`)) return;
    try {
      await client.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit removed');
    } catch { toast.error('Failed to delete'); }
  };

  // Today's pulse %
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completions?.some(c => c.date === today)).length;
  const pulse = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <TopBar />
      <main className="pt-24 pb-36 px-6 max-w-2xl mx-auto">

        {/* Greeting */}
        <p className="text-on-surface-variant font-semibold text-sm mb-1">{greeting}, {user?.name?.split(' ')[0] || 'Champion'} 👋</p>

        {/* Daily Summary */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="font-label text-on-surface-variant font-semibold tracking-wide uppercase text-xs mb-1">Today's Pulse</p>
              <h1 className="font-headline font-extrabold text-5xl tracking-tight text-primary">{pulse}%</h1>
            </div>
            <div className="text-right">
              <p className="font-label text-on-surface-variant font-semibold text-xs uppercase">Momentum</p>
              <p className="font-headline font-bold text-lg text-secondary">{bestStreak} Day Streak</p>
            </div>
          </div>
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pulse}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-2 font-medium">{completedToday} of {habits.length} habits done today</p>
        </section>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-surface-container-low rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && habits.length === 0 && (
          <div className="text-center py-16 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] text-primary">add_circle</span>
            </div>
            <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">emoji_nature</span>
            <h3 className="font-headline font-bold text-2xl text-primary mb-2">Start your journey</h3>
            <p className="text-on-surface-variant mb-6">Create your first habit using the + button below.</p>
          </div>
        )}

        {/* Habits Bento Grid */}
        {!loading && habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {habits.map(habit => {
              const isDone = habit.completions?.some(c => c.date === today);
              const borderColor = CATEGORY_COLORS[habit.color] || 'border-primary';
              const iconColor = habit.color === 'secondary' ? 'text-secondary' : habit.color === 'tertiary' ? 'text-tertiary' : 'text-primary';

              return (
                <div
                  key={habit._id}
                  className={`bg-surface-container-lowest p-5 rounded-xl border-l-4 ${borderColor} flex flex-col justify-between min-h-[160px] relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <span className={`material-symbols-outlined ${iconColor}`}>{habit.icon}</span>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDone ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {isDone ? 'Done' : 'Active'}
                      </div>
                    </div>
                    <h3 className="font-headline font-bold text-lg mt-3 text-primary">{habit.name}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">{habit.description}</p>
                  </div>
                  {/* Decorative BG */}
                  <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'wght' 200" }}>circle</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between relative z-10">
                    <span className="text-xs font-semibold text-on-surface-variant">{habit.currentStreak || 0} day streak</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteHabit(habit._id, habit.name)}
                        className="w-8 h-8 rounded-full border border-outline-variant text-outline flex items-center justify-center hover:bg-error/10 hover:border-error hover:text-error transition-all btn-spring"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <button
                        onClick={() => toggleComplete(habit)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-spring ${isDone ? 'bg-secondary text-white' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'} transition-all`}
                      >
                        <span className="material-symbols-outlined text-sm">{isDone ? 'check' : 'add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insights Teaser */}
        {!loading && (
          <section className="bg-tertiary p-6 rounded-4xl text-on-tertiary relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-xl mb-2">This Time For Real Pulse</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed max-w-[70%]">
                {pulse >= 80
                  ? "You're crushing it! Your consistency is building real momentum. Keep going! 🔥"
                  : pulse >= 50
                  ? "Good progress! Focus on your remaining habits to finish the day strong."
                  : "A fresh start every day. Check off your habits to build a winning streak!"}
              </p>
              <button
                onClick={() => navigate('/history')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                View Deep Analysis
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'wght' 100" }}>analytics</span>
            </div>
          </section>
        )}
      </main>

      <BottomNav />

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} onCreated={h => setHabits(prev => [...prev, h])} />}
    </div>
  );
}

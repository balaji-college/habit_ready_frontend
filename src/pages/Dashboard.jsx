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
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TODAY_NAME = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

// ── Day Chip Picker ───────────────────────────────────────────
function DayPicker({ value, onChange }) {
  const toggle = (day) => {
    if (value.includes(day)) {
      if (value.length === 1) return; // keep at least 1
      onChange(value.filter(d => d !== day));
    } else {
      onChange([...value, day]);
    }
  };
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Active Days</label>
      <div className="flex gap-1.5 flex-wrap">
        {ALL_DAYS.map(day => (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all btn-spring
              ${value.includes(day)
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Add Habit Modal ───────────────────────────────────────────
function AddHabitModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', icon: 'bolt', category: 'focus',
    color: 'primary', targetDays: [...ALL_DAYS],
  });
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
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
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
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, icon: CATEGORY_ICONS[e.target.value] || 'bolt' }))}
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
          <DayPicker value={form.targetDays} onChange={days => setForm(f => ({ ...f, targetDays: days }))} />
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

// ── Edit Habit Modal ──────────────────────────────────────────
function EditHabitModal({ habit, onClose, onEdited }) {
  const [form, setForm] = useState({
    name: habit.name || '',
    description: habit.description || '',
    icon: habit.icon || 'bolt',
    category: habit.category || 'other',
    color: habit.color || 'primary',
    targetDays: habit.targetDays || [...ALL_DAYS],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter a habit name'); return; }
    setLoading(true);
    try {
      const { data } = await client.put(`/habits/${habit._id}`, form);
      toast.success('Habit updated!');
      onEdited(data);
      onClose();
    } catch {
      toast.error('Failed to update habit');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-2xl text-primary">Edit Habit</h2>
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
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, icon: CATEGORY_ICONS[e.target.value] || 'bolt' }))}
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
          <DayPicker value={form.targetDays} onChange={days => setForm(f => ({ ...f, targetDays: days }))} />
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Saving…' : <><span className="material-symbols-outlined">check</span> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Log-it Sheet (note on completion) ────────────────────────
function LogItSheet({ habit, onClose, onLogged }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (withNote) => {
    setLoading(true);
    try {
      const { data } = await client.put(`/habits/${habit._id}/complete`, withNote ? { note } : {});
      onLogged(data);
      onClose();
    } catch {
      toast.error('Failed to update habit');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-headline font-bold text-xl text-primary">Log it 🎯</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{habit.name}</p>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface btn-spring">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Add a note <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="How did it go? What did you notice?"
            maxLength={280}
            rows={3}
            className="w-full px-4 py-3 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline font-body resize-none"
          />
          <p className="text-right text-[10px] text-outline mt-1">{note.length}/280</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => submit(false)}
            disabled={loading}
            className="flex-1 py-3 bg-surface-container-low text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container transition-colors text-sm disabled:opacity-60"
          >
            Quick Log
          </button>
          <button
            onClick={() => submit(true)}
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            {loading ? 'Logging…' : 'Log with Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);   // habit obj or null
  const [loggingHabit, setLoggingHabit] = useState(null);   // habit obj or null

  const fetchHabits = useCallback(async () => {
    try {
      const { data } = await client.get('/habits');
      setHabits(data);
    } catch {
      toast.error('Failed to load habits');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleLogged = (updated) => {
    setHabits(prev => prev.map(h => h._id === updated._id ? updated : h));
  };

  const handleEdited = (updated) => {
    setHabits(prev => prev.map(h => h._id === updated._id ? updated : h));
  };

  const toggleComplete = (habit) => {
    // If already done → un-complete immediately (no sheet needed)
    if (habit.completions?.some(c => c.date === today)) {
      client.put(`/habits/${habit._id}/complete`)
        .then(res => setHabits(prev => prev.map(h => h._id === res.data._id ? res.data : h)))
        .catch(() => toast.error('Failed to update habit'));
    } else {
      setLoggingHabit(habit);
    }
  };

  const deleteHabit = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from your habits? This can't be undone.`)) return;
    try {
      await client.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit removed');
    } catch { toast.error('Failed to delete'); }
  };

  // ── Stats ─────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  // Only count habits that are scheduled for today in the pulse
  const todayHabits = habits.filter(h => !h.targetDays?.length || h.targetDays.includes(TODAY_NAME));
  const completedToday = todayHabits.filter(h => h.completions?.some(c => c.date === today)).length;
  const pulse = todayHabits.length ? Math.round((completedToday / todayHabits.length) * 100) : 0;
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
          <p className="text-xs text-on-surface-variant mt-2 font-medium">
            {completedToday} of {todayHabits.length} habits done today
            {habits.length > todayHabits.length && (
              <span className="ml-1 opacity-60">· {habits.length - todayHabits.length} off today</span>
            )}
          </p>
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
              const isOffDay = habit.targetDays?.length && !habit.targetDays.includes(TODAY_NAME);
              const borderColor = CATEGORY_COLORS[habit.color] || 'border-primary';
              const iconColor = habit.color === 'secondary' ? 'text-secondary' : habit.color === 'tertiary' ? 'text-tertiary' : 'text-primary';
              const todayNote = habit.completions?.find(c => c.date === today)?.note;

              return (
                <div
                  key={habit._id}
                  className={`bg-surface-container-lowest p-5 rounded-xl border-l-4 ${borderColor} flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-opacity duration-300 ${isOffDay ? 'opacity-50' : ''}`}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <span className={`material-symbols-outlined ${iconColor}`}>{habit.icon}</span>
                      <div className="flex items-center gap-1.5">
                        {isOffDay && (
                          <div className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface-container-high text-on-surface-variant">
                            Off today
                          </div>
                        )}
                        {!isOffDay && (
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDone ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {isDone ? 'Done' : 'Active'}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-headline font-bold text-lg mt-3 text-primary">{habit.name}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">{habit.description}</p>
                    {todayNote && (
                      <p className="text-xs text-on-surface-variant mt-2 italic border-l-2 border-primary/30 pl-2 line-clamp-2">
                        "{todayNote}"
                      </p>
                    )}
                  </div>
                  {/* Decorative BG */}
                  <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'wght' 200" }}>circle</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between relative z-10">
                    <span className="text-xs font-semibold text-on-surface-variant">{habit.currentStreak || 0} day streak</span>
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => setEditingHabit(habit)}
                        className="w-8 h-8 rounded-full border border-outline-variant text-outline flex items-center justify-center hover:bg-primary/10 hover:border-primary hover:text-primary transition-all btn-spring"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteHabit(habit._id, habit.name)}
                        className="w-8 h-8 rounded-full border border-outline-variant text-outline flex items-center justify-center hover:bg-error/10 hover:border-error hover:text-error transition-all btn-spring"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      {/* Complete */}
                      <button
                        onClick={() => !isOffDay && toggleComplete(habit)}
                        disabled={isOffDay}
                        className={`w-8 h-8 rounded-full flex items-center justify-center btn-spring ${isOffDay ? 'border-2 border-outline-variant text-outline-variant cursor-not-allowed' : isDone ? 'bg-secondary text-white' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'} transition-all`}
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
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Modals */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onCreated={h => setHabits(prev => [...prev, h])}
        />
      )}
      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onEdited={handleEdited}
        />
      )}
      {loggingHabit && (
        <LogItSheet
          habit={loggingHabit}
          onClose={() => setLoggingHabit(null)}
          onLogged={handleLogged}
        />
      )}
    </div>
  );
}

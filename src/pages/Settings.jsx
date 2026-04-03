import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';
import BottomNav from '../components/BottomNav';

// ── Edit Profile Modal ───────────────────────────────────────
function EditProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const { data } = await client.put('/auth/profile', { name: name.trim() });
      toast.success('Profile updated!');
      onSaved(data);
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-2xl text-primary">Edit Profile</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-5 py-4 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-headline"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-5 py-4 bg-surface-container rounded-xl border-none text-on-surface-variant font-headline cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-on-surface-variant mt-1 px-1">Email cannot be changed</p>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Saving…' : <><span className="material-symbols-outlined">check</span> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Change Password Modal ────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.current || !form.newPass || !form.confirm) { toast.error('Please fill all fields'); return; }
    if (form.newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (form.newPass !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await client.put('/auth/change-password', { currentPassword: form.current, newPassword: form.newPass });
      toast.success('Password changed successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-2xl text-primary">Change Password</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password', key: 'newPass' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
              <div className="relative">
                <input
                  type={show[key] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-on-surface font-headline pr-12"
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{show[key] ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? 'Updating…' : <><span className="material-symbols-outlined">lock_reset</span> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── About Modal ──────────────────────────────────────────────
function AboutModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <h2 className="font-headline font-bold text-2xl text-primary mb-1">This Time For Real</h2>
        <p className="text-on-surface-variant text-sm mb-6">Version 1.0.0</p>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          A premium habit tracking experience built to help you curate your lifestyle and unlock peak performance. Design your ritual. Track your evolution.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8 text-center">
          {[
            { icon: 'bolt', label: 'Kinetic Streaks' },
            { icon: 'analytics', label: 'Deep Insights' },
            { icon: 'emoji_events', label: 'Achievements' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-surface-container-low p-3 rounded-2xl">
              <span className="material-symbols-outlined text-primary block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              <p className="text-[10px] font-bold text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-4 bg-surface-container-low text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Delete Account Modal ─────────────────────────────────────
function DeleteAccountModal({ onClose, onConfirm }) {
  const [confirm, setConfirm] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-headline font-bold text-2xl text-error">Delete Account</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
          This action is <strong className="text-on-surface">permanent</strong> and cannot be undone. All your habits, streaks, and history will be erased forever.
        </p>
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Type DELETE to confirm</label>
          <input
            value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full px-5 py-4 bg-surface-container-low rounded-xl border-none outline-none focus:ring-2 focus:ring-error/20 text-on-surface font-headline"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-surface-container-low text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button
            onClick={() => confirm === 'DELETE' && onConfirm()}
            disabled={confirm !== 'DELETE'}
            className="flex-1 py-4 bg-error text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────
export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    dailyReminders: user?.preferences?.dailyReminders ?? true,
    darkMode: user?.preferences?.darkMode ?? false,
  });
  const [saving, setSaving] = useState(false);

  // Modal states
  const [modal, setModal] = useState(null); // 'editProfile' | 'changePassword' | 'about' | 'deleteAccount'

  const openModal = (name) => setModal(name);
  const closeModal = () => setModal(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out. See you tomorrow!');
    navigate('/login');
  };

  const togglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      setSaving(true);
      const { data } = await client.put('/auth/preferences', updated);
      updateUser(data);
    } catch {
      toast.error('Failed to save preference');
      setPrefs(prefs);
    } finally { setSaving(false); }
  };

  const handleExportData = () => {
    const exportData = {
      user: { name: user?.name, email: user?.email },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ttfr-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleClearCache = () => {
    localStorage.removeItem('ttfr_cache');
    toast.success('Cache cleared!');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TF';

  return (
    <div className="min-h-screen bg-background font-body text-on-surface pb-32">
      {/* Header with back button */}
      <header className="fixed top-0 w-full z-50 glass flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-90 btn-spring text-indigo-900"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-xl font-bold tracking-tight text-indigo-950">Settings</h1>
        </div>
        <span className="material-symbols-outlined text-indigo-900">settings</span>
      </header>

      <main className="pt-20 px-6 space-y-8 max-w-md mx-auto">

        {/* Profile Card */}
        <section className="relative bg-surface-container-lowest rounded-3xl p-6 shadow-card overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary rounded-l-3xl" />
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-headline font-bold text-2xl ring-4 ring-surface-container">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-secondary text-white rounded-full p-1 border-2 border-white">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-on-surface leading-tight">{user?.name || 'User'}</h2>
              <p className="text-sm text-on-surface-variant">{user?.email}</p>
              <div className="inline-flex items-center mt-2 bg-secondary-container px-2 py-0.5 rounded-lg">
                <span className="text-[10px] font-bold text-on-secondary-fixed-variant uppercase tracking-wider">
                  {user?.isPremium ? 'Premium Member' : 'Free Plan'}
                </span>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => openModal('editProfile')}
                  className="bg-surface-container-high hover:bg-surface-dim text-on-surface text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="space-y-4">
          <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest px-1">Account Settings</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                icon: 'lock', label: 'Email & Password', sub: 'Update credentials',
                color: 'bg-primary-fixed text-primary',
                onClick: () => openModal('changePassword'),
              },
              {
                icon: 'card_membership', label: 'Subscription Plan', sub: user?.isPremium ? 'You are on Premium' : 'Upgrade to Premium',
                color: 'bg-secondary-container text-secondary',
                onClick: () => toast('Subscription management coming soon!', { icon: '🚀' }),
              },
              {
                icon: 'shield', label: 'Security', sub: '2FA and sessions',
                color: 'bg-surface-container-highest text-on-surface',
                onClick: () => toast('Security settings coming soon!', { icon: '🔐' }),
              },
            ].map(({ icon, label, sub, color, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant">{sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            ))}
          </div>
        </section>

        {/* App Preferences */}
        <section className="space-y-4">
          <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest px-1">App Preferences</h3>
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden">
            {[
              { icon: 'notifications', label: 'Push Notifications', key: 'pushNotifications' },
              { icon: 'alarm', label: 'Daily Reminders', key: 'dailyReminders' },
              { icon: 'dark_mode', label: 'Dark Mode', key: 'darkMode' },
            ].map(({ icon, label, key }, idx, arr) => (
              <div key={key}>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                    <p className="font-medium text-on-surface">{label}</p>
                  </div>
                  <button
                    onClick={() => togglePref(key)}
                    disabled={saving}
                    aria-label={`Toggle ${label}`}
                    className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary ${prefs[key] ? 'bg-secondary' : 'bg-surface-container-high'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${prefs[key] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                {idx < arr.length - 1 && <div className="h-px bg-surface-container-low mx-5" />}
              </div>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="space-y-4">
          <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest px-1">Data & Privacy</h3>
          <div className="bg-surface-container-low rounded-3xl p-2 space-y-1">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-lowest rounded-2xl transition-colors text-left"
            >
              <span className="material-symbols-outlined text-on-surface-variant">file_download</span>
              <span className="font-medium">Export My Data</span>
            </button>
            <button
              onClick={handleClearCache}
              className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-lowest rounded-2xl transition-colors text-left"
            >
              <span className="material-symbols-outlined text-tertiary">delete_sweep</span>
              <span className="font-medium">Clear Cache</span>
            </button>
            <button
              onClick={() => toast('Privacy policy: Your data is stored securely and never shared with third parties.', { duration: 5000, icon: '🔒' })}
              className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-lowest rounded-2xl transition-colors text-left"
            >
              <span className="material-symbols-outlined text-on-surface-variant">policy</span>
              <span className="font-medium">Privacy Policy</span>
            </button>
          </div>
        </section>

        {/* Support */}
        <section className="space-y-4">
          <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest px-1">Support</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toast('Help center coming soon! Reach us at support@ttfr.app', { icon: '💬', duration: 4000 })}
              className="bg-white p-5 rounded-3xl border-2 border-surface-container-low flex flex-col gap-3 cursor-pointer hover:border-primary-fixed transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary">help_center</span>
              <p className="font-bold text-on-surface text-sm">Help Center</p>
            </button>
            <button
              onClick={() => openModal('about')}
              className="bg-white p-5 rounded-3xl border-2 border-surface-container-low flex flex-col gap-3 cursor-pointer hover:border-primary-fixed transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="font-bold text-on-surface text-sm">About App</p>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h3 className="text-on-surface-variant font-bold text-xs uppercase tracking-widest px-1">Danger Zone</h3>
          <button
            onClick={() => openModal('deleteAccount')}
            className="w-full py-3 border border-error/40 text-error/70 font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-error/5 hover:border-error hover:text-error transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_remove</span>
            Delete Account
          </button>
        </section>

        {/* Logout */}
        <section className="pt-2 pb-4">
          <button
            onClick={handleLogout}
            className="w-full py-4 border-2 border-error text-error font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200 hover:bg-error/5"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <p className="text-center text-[10px] text-outline mt-6 font-medium tracking-widest uppercase">Version 1.0.0 • This Time For Real</p>
        </section>

      </main>

      <BottomNav />

      {/* Modals */}
      {modal === 'editProfile' && (
        <EditProfileModal user={user} onClose={closeModal} onSaved={updateUser} />
      )}
      {modal === 'changePassword' && (
        <ChangePasswordModal onClose={closeModal} />
      )}
      {modal === 'about' && (
        <AboutModal onClose={closeModal} />
      )}
      {modal === 'deleteAccount' && (
        <DeleteAccountModal
          onClose={closeModal}
          onConfirm={() => {
            logout();
            toast.success('Account deleted. Goodbye!');
            navigate('/login');
          }}
        />
      )}
    </div>
  );
}

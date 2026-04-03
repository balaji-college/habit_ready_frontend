import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import toast from 'react-hot-toast';

// ── Forgot Password Inline Modal ──────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email address'); return; }
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm px-4 pb-4">
      <div className="bg-surface-container-lowest rounded-4xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-2xl text-primary">Reset Password</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {sent ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-5xl text-secondary block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            <h3 className="font-headline font-bold text-xl text-primary mb-2">Check your inbox</h3>
            <p className="text-on-surface-variant text-sm mb-6">If <span className="font-semibold text-on-surface">{email}</span> is registered, you'll receive a reset link shortly.</p>
            <button onClick={onClose} className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all">
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-on-surface-variant text-sm">Enter your account email and we'll send you a reset link.</p>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline border-0 focus:ring-2 focus:ring-primary/20 outline-none font-headline"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary text-white font-headline font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending…' : <><span className="material-symbols-outlined">send</span> Send Reset Link</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center overflow-x-hidden relative">
      {/* Background blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl -z-10" />
      <div className="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-3xl -z-10" />

      <div className="container max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
        {/* Visual Column — Desktop only */}
        <div className="hidden md:flex flex-col relative py-12">
          <div className="relative z-10">
            <h2 className="font-headline text-6xl text-primary font-extrabold tracking-tighter leading-none mb-6">
              Master your <br />
              <span className="text-secondary">momentum.</span>
            </h2>
            <p className="text-on-surface-variant font-body text-lg max-w-md leading-relaxed mb-8">
              Join the elite community using rhythmic habit tracking to curate their lifestyle journals and unlock peak performance.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-card">
                <span className="material-symbols-outlined text-secondary mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <p className="font-headline font-bold text-primary">Kinetic Streaks</p>
                <p className="text-xs text-on-surface-variant mt-1">Real-time progress syncing</p>
              </div>
              <div className="bg-primary text-white p-6 rounded-3xl transform translate-y-8 shadow-xl">
                <span className="material-symbols-outlined text-secondary-fixed mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <p className="font-headline font-bold">Deep Insights</p>
                <p className="text-xs opacity-70 mt-1">Predictive habit modeling</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="flex flex-col justify-center">
          <div className="bg-surface-container-lowest md:glass p-8 md:p-12 rounded-4xl shadow-none md:shadow-glass">
            <div className="mb-10 text-center md:text-left">
              <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">This Time For Real</h1>
              <p className="text-on-surface-variant font-body mt-2">Welcome back to your ritual.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold font-headline text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input
                    id="email" name="email" type="email"
                    placeholder="name@example.com"
                    value={form.email} onChange={handleChange}
                    className="w-full bg-surface-container-low rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline border-0 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-headline"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold font-headline text-on-surface-variant" htmlFor="password">Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-bold text-secondary hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    id="password" name="password" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    className="w-full bg-surface-container-low rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-outline border-0 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-headline"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute inset-y-0 right-4 flex items-center text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-primary text-white font-headline font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-container-lowest px-4 text-outline font-bold tracking-widest font-headline">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['Google', 'Facebook'].map(provider => (
                <button
                  key={provider} type="button"
                  onClick={() => toast(`${provider} login coming soon!`, { icon: '🚀' })}
                  className="flex items-center justify-center gap-3 bg-surface-container-high py-4 rounded-xl hover:bg-surface-container-highest transition-colors font-headline font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">{provider === 'Google' ? 'language' : 'public'}</span>
                  {provider}
                </button>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm font-body text-on-surface-variant">
                New to the rhythm?{' '}
                <Link to="/signup" className="text-primary font-bold hover:text-secondary ml-1 transition-colors">Start for free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

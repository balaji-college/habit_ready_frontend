import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to This Time For Real! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative">
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-surface-container-low rounded-4xl overflow-hidden">
        {/* Brand Side */}
        <div className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden bg-primary-container text-white">
          <div className="absolute -top-20 -right-20 w-80 h-80 border-[24px] border-secondary/20 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h1 className="font-headline font-extrabold text-4xl tracking-tighter mb-2">This Time For Real</h1>
            <p className="font-body text-on-primary-container text-lg max-w-xs opacity-80">Design your Habitz. Track your evolution.</p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <p className="font-headline font-bold text-xl">Join 50k+ achievers</p>
                <p className="text-sm opacity-70">Elevate your daily rhythm starting today.</p>
              </div>
            </div>
            <div className="glass p-6 rounded-2xl text-primary">
              <p className="italic font-medium mb-2 leading-relaxed">"The more you
                sweat in
                practice, the less
                you bleed in
                battle."</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">— Richard Marcinko</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-transparent opacity-40 pointer-events-none" />
        </div>

        {/* Form Side */}
        <div className="bg-surface-container-lowest p-8 md:p-16 flex flex-col justify-center">
          {/* Mobile brand */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="font-headline font-extrabold text-xl tracking-tighter text-primary">This Time For Real</span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline font-bold text-3xl text-primary tracking-tight mb-2">Create Account</h2>
            <p className="text-on-surface-variant font-medium">Begin your journey toward a focused Habitz.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {[
              { label: 'Full Name', id: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email Address', id: 'email', type: 'email', placeholder: 'name@example.com' },
            ].map(({ label, id, type, placeholder }) => (
              <div key={id}>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor={id}>{label}</label>
                <input
                  id={id} name={id} type={type} placeholder={placeholder}
                  value={form[id]} onChange={handleChange}
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400 focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={form.password} onChange={handleChange}
                  className="w-full px-5 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-slate-400 focus:ring-2 focus:ring-secondary outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Creating account…</>
                ) : (
                  <> Get Started <span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-on-surface-variant leading-relaxed px-4">
              By clicking "Get Started", you agree to our{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="mt-10 text-center text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

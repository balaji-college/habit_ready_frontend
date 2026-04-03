import { useAuth } from '../context/AuthContext';

export default function TopBar({ title, showNotif = true }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'TF';

  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-headline font-bold text-sm">
          {initials}
        </div>
        <span className="text-indigo-950 font-headline text-2xl font-extrabold tracking-tighter">
          {title || 'This Time For Real'}
        </span>
      </div>
      {showNotif && (
        <button className="text-indigo-900 hover:opacity-70 transition-opacity btn-spring">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      )}
    </header>
  );
}

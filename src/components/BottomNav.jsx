import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', icon: 'bolt', label: 'Today' },
  { path: '/history',   icon: 'calendar_today', label: 'History' },
  { path: '/insights',  icon: 'analytics', label: 'Insights' },
  { path: '/settings',  icon: 'person', label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 glass z-50 rounded-t-4xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map(({ path, icon, label }) => {
        const active = pathname === path || (pathname === '/' && path === '/dashboard');
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 ease-out btn-spring
              ${active
                ? 'bg-indigo-100 text-indigo-900 scale-110'
                : 'text-slate-400 hover:text-indigo-700'
              }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="font-body text-[11px] font-semibold tracking-wide uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

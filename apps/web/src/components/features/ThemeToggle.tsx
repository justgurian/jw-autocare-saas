import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light mode' },
    { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
    { value: 'system' as const, icon: Monitor, label: 'System preference' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-black/20 p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`rounded-md p-2 transition-colors ${
            theme === value
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          aria-label={label}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

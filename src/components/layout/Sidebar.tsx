import React from 'react';
import { useSchool, ActiveTab } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Award,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  Settings,
  Database,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, data } = useSchool();

  // Counts & metrics for badges
  const activeStudentsCount = data.students.filter((s) => s.status === 'Active').length;
  const pendingInvoicesCount = data.invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue').length;

  const navigationItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      badge: activeStudentsCount,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck2,
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: Award,
    },
    {
      id: 'fees',
      label: 'Fees',
      icon: CreditCard,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarDays,
    },
    {
      id: 'users',
      label: 'Staff & Roles',
      icon: ShieldCheck,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside id="desktop-sidebar" className="w-56 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between select-none shrink-0">
      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core System
        </div>
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 opacity-80'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-blue-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status (Simulated Desktop SQLite Engine) */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase mb-1 font-bold tracking-wider">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <p className="text-xs text-slate-300 italic truncate">Local Database: Connected</p>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            {data.students.length} Stus • {data.invoices.length} Invs
          </p>
        </div>
      </div>
    </aside>
  );
};

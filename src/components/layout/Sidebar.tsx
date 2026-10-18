// ============================================================
// Kerala EG Studio — Sidebar Navigation
// The 10 main sections required by Section 3 of specification
// ============================================================

import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  Compass,
  GraduationCap,
  Library,
  FileCheck2,
  History,
  BookmarkCheck,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'solve', label: 'Solve a Question', icon: HelpCircle, badge: 'Solver' },
  { id: 'workspace', label: 'Drawing Workspace', icon: Compass },
  { id: 'learning', label: 'Step-by-Step Learning', icon: GraduationCap },
  { id: 'library', label: 'Topic Library', icon: Library },
  { id: 'practice', label: 'Practice Questions', icon: FileCheck2 },
  { id: 'pyq', label: 'Previous-Year Questions', icon: History, badge: 'KTU' },
  { id: 'cad', label: '2D CAD Drafting', icon: Compass, badge: 'Lab' },
  { id: 'saved', label: 'Saved Solutions', icon: BookmarkCheck },
  { id: 'progress', label: 'My Progress', icon: TrendingUp },
  { id: 'curriculum', label: 'Curriculum Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, curriculum } = useAppStore();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 select-none">
      {/* Brand header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
          EG
        </div>
        <div>
          <h1 className="font-semibold text-white text-sm leading-tight tracking-wide">
            Kerala EG Studio
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {curriculum ? `${curriculum.courseCode} (${curriculum.scheme})` : 'KTU 2024 / 2019'}
          </p>
        </div>
      </div>

      {/* Nav list */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-[calc(100%-16px)] mx-2 flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer stats / session info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Projection System</span>
          <span className="font-mono text-blue-400">1st Angle (BIS)</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-slate-500">Geometry Engine</span>
          <span className="font-mono text-emerald-400">Deterministic SVG</span>
        </div>
      </div>
    </aside>
  );
};

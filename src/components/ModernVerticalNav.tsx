import { Calendar, Users, CheckSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ModernVerticalNavProps {
  currentView: 'appointments' | 'patients' | 'tasks' | 'settings';
  onNavigateToAppointments: () => void;
  onNavigateToPatients: () => void;
  onNavigateToTasks: () => void;
  onNavigateToSettings?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function ModernVerticalNav({
  currentView,
  onNavigateToAppointments,
  onNavigateToPatients,
  onNavigateToTasks,
  onNavigateToSettings,
  onCollapseChange
}: ModernVerticalNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const navItems = [
    { id: 'appointments', label: 'Appointments', icon: Calendar, onClick: onNavigateToAppointments },
    { id: 'patients', label: 'Patient Search', icon: Users, onClick: onNavigateToPatients },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, onClick: onNavigateToTasks },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: onNavigateToSettings },
  ];

  return (
    <div 
      className="fixed left-0 top-[57px] bottom-0 bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 z-40"
      style={{ width: isCollapsed ? '72px' : '240px' }}
    >
      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentView === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-white'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

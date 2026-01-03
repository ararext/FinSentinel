import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Radio, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/new', icon: PlusCircle, label: 'New Transaction' },
  { to: '/dashboard/live', icon: Radio, label: 'Live Stream' },
  { to: '/dashboard/results', icon: BarChart3, label: 'Risk Results' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-semibold text-sidebar-foreground">
              FinSentinel
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-3 px-3 py-2">
            <p className="text-xs text-sidebar-foreground/50">Logged in as</p>
            <p className="text-sm text-sidebar-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
            collapsed ? 'justify-center px-0' : 'justify-start'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent/80 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;

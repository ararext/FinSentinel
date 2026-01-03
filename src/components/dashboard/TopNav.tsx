import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationDropdown from './NotificationDropdown';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/lib/types';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/new': 'New Transaction',
  '/dashboard/live': 'Live Stream',
  '/dashboard/results': 'Risk Results',
  '/dashboard/settings': 'Settings',
};

const TopNav: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await notificationsApi.getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <h1 className="text-xl font-display font-semibold">{title}</h1>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="w-64 pl-9 h-9 bg-muted border-0"
            />
          </div>
          
          <NotificationDropdown notifications={notifications} />
        </div>
      </div>
    </header>
  );
};

export default TopNav;

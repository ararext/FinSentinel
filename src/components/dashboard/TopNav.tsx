import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;

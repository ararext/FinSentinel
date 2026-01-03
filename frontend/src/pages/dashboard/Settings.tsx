import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Bell, Shield, Moon } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-display font-light tracking-tight mb-2">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-muted-foreground">Your personal information</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            readOnly
          />
          <Input
            label="Name"
            value={user?.name || ''}
            disabled
            readOnly
          />
          <Input
            label="Role"
            value={user?.role || ''}
            disabled
            readOnly
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Configure alert preferences</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <p className="font-medium text-sm">High Risk Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified for high-risk transactions</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <p className="font-medium text-sm">Daily Summary</p>
              <p className="text-xs text-muted-foreground">Receive daily transaction summaries</p>
            </div>
            <Button variant="ghost" size="sm">Disabled</Button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage your security settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Enable Two-Factor Authentication
          </Button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Moon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-sm text-muted-foreground">Customize the look and feel</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
          <div>
            <p className="font-medium text-sm">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Use dark theme across the application</p>
          </div>
          <Button variant="outline" size="sm">System</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  User, 
  Shield,
  Database,
  Palette,
  Volume2,
  VolumeX,
  Monitor
} from 'lucide-react';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    taskReminders: boolean;
    habitReminders: boolean;
    timerAlerts: boolean;
    emailDigest: boolean;
  };
  preferences: {
    defaultView: string;
    autoSave: boolean;
    soundEnabled: boolean;
    compactMode: boolean;
    showStats: boolean;
  };
  profile: {
    name: string;
    email: string;
    timezone: string;
  };
}

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: {
      taskReminders: true,
      habitReminders: true,
      timerAlerts: true,
      emailDigest: false
    },
    preferences: {
      defaultView: 'dashboard',
      autoSave: true,
      soundEnabled: true,
      compactMode: false,
      showStats: true
    },
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      timezone: 'America/New_York'
    }
  });

  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('productivity-app-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('productivity-app-settings', JSON.stringify(settings));
    
    // Apply theme changes
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings]);

  const updateSettings = (section: keyof UserSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      theme: 'system',
      notifications: {
        taskReminders: true,
        habitReminders: true,
        timerAlerts: true,
        emailDigest: false
      },
      preferences: {
        defaultView: 'dashboard',
        autoSave: true,
        soundEnabled: true,
        compactMode: false,
        showStats: true
      },
      profile: {
        name: '',
        email: '',
        timezone: 'America/New_York'
      }
    };
    setSettings(defaultSettings);
  };

  const exportData = async () => {
    setIsExporting(true);
    
    // Mock data export - in a real app, this would gather all user data
    const exportData = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      data: {
        tasks: [], // Would be populated with actual task data
        notes: [], // Would be populated with actual note data
        habits: [], // Would be populated with actual habit data
        goals: [], // Would be populated with actual goal data
        journal: [], // Would be populated with actual journal data
        projects: [], // Would be populated with actual project data
        budget: [] // Would be populated with actual budget data
      }
    };

    try {
      const dataStr = exportFormat === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData);
      
      const blob = new Blob([dataStr], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `productivity-app-backup-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for demo - would be more sophisticated in a real app
    return 'Export Date,Version,Settings\n' + 
           `${data.exportDate},${data.version},"${JSON.stringify(data.settings).replace(/"/g, '""')}"`;
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (importedData.settings) {
          setSettings(importedData.settings);
        }
        
        // In a real app, you would also import the actual data
        console.log('Data imported successfully:', importedData);
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      resetSettings();
    }
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles', 
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Color Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred color theme
                      </p>
                    </div>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        updateSettings('theme', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use smaller spacing and condensed layouts
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.compactMode}
                      onCheckedChange={(checked) =>
                        updateSettings('preferences', { compactMode: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about upcoming task deadlines
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.taskReminders}
                      onCheckedChange={(checked) =>
                        updateSettings('notifications', { taskReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Habit Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily reminders to complete your habits
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.habitReminders}
                      onCheckedChange={(checked) =>
                        updateSettings('notifications', { habitReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Timer Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Sound alerts when timer sessions complete
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.timerAlerts}
                      onCheckedChange={(checked) =>
                        updateSettings('notifications', { timerAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of your productivity
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailDigest}
                      onCheckedChange={(checked) =>
                        updateSettings('notifications', { emailDigest: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Default View</Label>
                      <p className="text-sm text-muted-foreground">
                        Page to show when you open the app
                      </p>
                    </div>
                    <Select 
                      value={settings.preferences.defaultView} 
                      onValueChange={(value) => 
                        updateSettings('preferences', { defaultView: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="todos">Tasks</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="journal">Journal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you type
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.autoSave}
                      onCheckedChange={(checked) =>
                        updateSettings('preferences', { autoSave: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for interactions and alerts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.preferences.soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={settings.preferences.soundEnabled}
                        onCheckedChange={(checked) =>
                          updateSettings('preferences', { soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Statistics</Label>
                      <p className="text-sm text-muted-foreground">
                        Display productivity stats on dashboard
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.showStats}
                      onCheckedChange={(checked) =>
                        updateSettings('preferences', { showStats: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) =>
                        updateSettings('profile', { name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) =>
                        updateSettings('profile', { email: e.target.value })
                      }
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.profile.timezone} 
                      onValueChange={(value) => 
                        updateSettings('profile', { timezone: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Export Data</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download a backup of all your data
                      </p>
                      <div className="flex gap-2">
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={exportData} 
                          disabled={isExporting}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {isExporting ? 'Exporting...' : 'Export Data'}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Import Data</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Restore data from a previous backup
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".json"
                          onChange={importData}
                          disabled={isImporting}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {isImporting && <Badge variant="secondary">Importing...</Badge>}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanently delete all your data
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={clearAllData}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reset Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Reset all settings to their default values
                  </p>
                  <Button variant="outline" onClick={resetSettings}>
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
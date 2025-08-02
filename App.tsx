import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TodoList } from './components/TodoList';
import { Notes } from './components/Notes';
import { Habits } from './components/Habits';
import { Timer } from './components/Timer';
import { Goals } from './components/Goals';
import { Analytics } from './components/Analytics';
import { Tools } from './components/Tools';
import { Budget } from './components/Budget';
import { Projects } from './components/Projects';
import { Journal } from './components/Journal';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { 
  Home, 
  CheckSquare, 
  FileText, 
  Target, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Calculator,
  DollarSign,
  FolderOpen,
  BookOpen,
  MoreHorizontal,
  Settings2,
  LogOut,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

interface User {
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalHabits: 0,
    completedHabits: 0
  });

  // Check for saved user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('productivity-app-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to load user session:', error);
        localStorage.removeItem('productivity-app-user');
      }
    }
  }, []);

  // Load settings to determine default view
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem('productivity-app-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.preferences?.defaultView) {
            setActiveTab(settings.preferences.defaultView);
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    }
  }, [user]);

  // This would typically come from your actual data
  // For demo purposes, we'll use mock data that updates
  useEffect(() => {
    if (user) {
      setStats({
        totalTasks: 3,
        completedTasks: 1,
        totalNotes: 2,
        totalHabits: 3,
        completedHabits: 1
      });
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('productivity-app-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('productivity-app-user');
    setActiveTab('dashboard');
  };

  // If user is not logged in, show auth component
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const primaryNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'todos', label: 'Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'goals', label: 'Goals', icon: TrendingUp }
  ];

  const secondaryNavigationItems = [
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'tools', label: 'Tools', icon: Calculator },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />;
      case 'todos':
        return <TodoList />;
      case 'notes':
        return <Notes />;
      case 'habits':
        return <Habits />;
      case 'timer':
        return <Timer />;
      case 'goals':
        return <Goals />;
      case 'analytics':
        return <Analytics />;
      case 'tools':
        return <Tools />;
      case 'budget':
        return <Budget />;
      case 'projects':
        return <Projects />;
      case 'journal':
        return <Journal />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg border">
            {/* Left side - Navigation items */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary Navigation */}
              <div className="flex flex-wrap gap-2">
                {primaryNavigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                ))}
              </div>

              {/* More Menu for Secondary Items */}
              <DropdownMenu>
                <DropdownMenuTrigger 
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${
                    secondaryNavigationItems.some(item => item.id === activeTab) 
                      ? "bg-primary text-primary-foreground shadow hover:bg-primary/90" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {secondaryNavigationItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.id} 
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-4">
              {/* Welcome message - hidden on mobile */}
              <div className="hidden md:block text-sm text-muted-foreground">
                Welcome back, {user.name.split(' ')[0]}!
              </div>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setActiveTab('profile')} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab('settings')} className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pb-8">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4 border-t">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>Stay productive and achieve your goals! 🎯</span>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('settings')}
              className="hover:text-foreground transition-colors underline"
            >
              Settings
            </button>
            <span>•</span>
            <button 
              onClick={handleLogout}
              className="hover:text-foreground transition-colors underline"
            >
              Sign Out
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
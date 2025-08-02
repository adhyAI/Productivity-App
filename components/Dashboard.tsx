import { Calendar, CheckSquare, FileText, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalNotes: number;
    totalHabits: number;
    completedHabits: number;
  };
}

export function Dashboard({ activeTab, setActiveTab, stats }: DashboardProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const quickStats = [
    {
      title: 'Tasks',
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      description: 'completed today',
      icon: CheckSquare,
      color: 'text-blue-500'
    },
    {
      title: 'Habits',
      value: `${stats.completedHabits}/${stats.totalHabits}`,
      description: 'completed today',
      icon: Target,
      color: 'text-green-500'
    },
    {
      title: 'Notes',
      value: stats.totalNotes.toString(),
      description: 'total notes',
      icon: FileText,
      color: 'text-purple-500'
    }
  ];

  const navigationItems = [
    { id: 'todos', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'habits', label: 'Habits', icon: Target }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Good morning!</h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          {formattedDate}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump to different sections of your productivity dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "outline"}
                className="flex items-center gap-2 justify-start h-12"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Tip */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Productivity Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Break large tasks into smaller, manageable chunks. This makes them less overwhelming 
            and gives you a sense of progress as you complete each part.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
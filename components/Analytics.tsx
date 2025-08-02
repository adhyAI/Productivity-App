import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, CheckSquare, FileText, Calendar, Award } from 'lucide-react';

export function Analytics() {
  // Mock data - in a real app, this would come from your actual data
  const weeklyTaskData = [
    { day: 'Mon', completed: 8, total: 12 },
    { day: 'Tue', completed: 6, total: 10 },
    { day: 'Wed', completed: 9, total: 11 },
    { day: 'Thu', completed: 7, total: 9 },
    { day: 'Fri', completed: 10, total: 13 },
    { day: 'Sat', completed: 5, total: 8 },
    { day: 'Sun', completed: 4, total: 6 }
  ];

  const habitTrendData = [
    { week: 'W1', completion: 85 },
    { week: 'W2', completion: 90 },
    { week: 'W3', completion: 78 },
    { week: 'W4', completion: 95 },
    { week: 'W5', completion: 88 },
    { week: 'W6', completion: 92 }
  ];

  const categoryData = [
    { name: 'Work', value: 45, color: '#3b82f6' },
    { name: 'Personal', value: 25, color: '#10b981' },
    { name: 'Learning', value: 20, color: '#f59e0b' },
    { name: 'Health', value: 10, color: '#ef4444' }
  ];

  const monthlyStats = {
    tasksCompleted: 156,
    notesCreated: 23,
    habitsCompleted: 89,
    goalsAchieved: 3,
    totalFocusTime: 1240, // minutes
    averageProductivity: 78 // percentage
  };

  const achievements = [
    { id: 1, title: 'Task Master', description: 'Completed 100 tasks', icon: CheckSquare, earned: true },
    { id: 2, title: 'Habit Builder', description: '30-day streak', icon: Target, earned: true },
    { id: 3, title: 'Note Taker', description: 'Created 50 notes', icon: FileText, earned: false },
    { id: 4, title: 'Focus Champion', description: '100 hours focused', icon: TrendingUp, earned: false }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(monthlyStats.totalFocusTime)}</div>
            <p className="text-xs text-muted-foreground">Total focused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Streak</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.habitsCompleted}%</div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.averageProductivity}%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTaskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Habit Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={habitTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}: {category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                      : 'bg-muted/50'
                  }`}
                >
                  <achievement.icon 
                    className={`h-5 w-5 ${
                      achievement.earned ? 'text-green-600' : 'text-muted-foreground'
                    }`} 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.earned && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-600">What's Working Well</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consistent morning task completion</li>
                <li>• Strong habit streak maintenance</li>
                <li>• Effective use of focus time</li>
                <li>• Good work-life balance in tasks</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-orange-600">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Weekend productivity could be higher</li>
                <li>• Consider breaking large tasks down</li>
                <li>• Add more learning-focused activities</li>
                <li>• Set more specific deadlines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
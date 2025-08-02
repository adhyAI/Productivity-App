import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Plus, Target, Calendar, Edit2, Trash2, Save, X } from 'lucide-react';

type GoalCategory = 'career' | 'health' | 'personal' | 'learning' | 'finance';
type GoalStatus = 'active' | 'completed' | 'paused';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  targetDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Learn React Development',
      description: 'Complete a comprehensive React course and build 3 projects',
      category: 'learning',
      status: 'active',
      progress: 65,
      targetDate: '2025-03-15',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Run a Half Marathon',
      description: 'Train consistently and complete a 21K run',
      category: 'health',
      status: 'active',
      progress: 30,
      targetDate: '2025-06-01',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Save $5000',
      description: 'Build emergency fund by saving consistently each month',
      category: 'finance',
      status: 'active',
      progress: 80,
      targetDate: '2025-12-31',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal' as GoalCategory,
    targetDate: '',
    progress: 0
  });

  const categories: { value: GoalCategory; label: string; color: string }[] = [
    { value: 'career', label: 'Career', color: 'bg-blue-500' },
    { value: 'health', label: 'Health', color: 'bg-green-500' },
    { value: 'personal', label: 'Personal', color: 'bg-purple-500' },
    { value: 'learning', label: 'Learning', color: 'bg-orange-500' },
    { value: 'finance', label: 'Finance', color: 'bg-emerald-500' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      targetDate: '',
      progress: 0
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    resetForm();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    resetForm();
  };

  const saveGoal = () => {
    if (formData.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        status: 'active',
        progress: formData.progress,
        targetDate: formData.targetDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setGoals(prev => [goal, ...prev]);
      setIsCreating(false);
      resetForm();
    }
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      progress: goal.progress
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    resetForm();
  };

  const updateGoal = () => {
    if (editingId && formData.title.trim()) {
      setGoals(goals.map(goal =>
        goal.id === editingId
          ? {
              ...goal,
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category,
              progress: formData.progress,
              targetDate: formData.targetDate,
              updatedAt: new Date()
            }
          : goal
      ));
      setEditingId(null);
      resetForm();
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const updateProgress = (id: string, newProgress: number) => {
    setGoals(goals.map(goal =>
      goal.id === id
        ? {
            ...goal,
            progress: Math.max(0, Math.min(100, newProgress)),
            status: newProgress >= 100 ? 'completed' : goal.status,
            updatedAt: new Date()
          }
        : goal
    ));
  };

  const getCategoryInfo = (category: GoalCategory) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals
            </div>
            <Button onClick={startCreating} size="sm" disabled={isCreating}>
              <Plus className="h-4 w-4 mr-1" />
              New Goal
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedGoals.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / Math.max(goals.length, 1))}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </div>
          </div>

          {isCreating && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4 mb-6">
              <Input
                placeholder="Goal title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Goal description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as GoalCategory }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Date</label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveGoal} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save Goal
                </Button>
                <Button onClick={cancelCreating} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {goals.map((goal) => {
          const categoryInfo = getCategoryInfo(goal.category);
          const daysUntil = getDaysUntilTarget(goal.targetDate);
          const isEditing = editingId === goal.id;

          return (
            <Card key={goal.id} className={goal.status === 'completed' ? 'opacity-75' : ''}>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as GoalCategory }))}
                        className="p-2 border rounded-md bg-background"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      <Input
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Progress %"
                        value={formData.progress}
                        onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateGoal} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{goal.title}</h3>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${categoryInfo.color}`} />
                            {categoryInfo.label}
                          </Badge>
                          {goal.status === 'completed' && (
                            <Badge variant="default">Completed</Badge>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-muted-foreground text-sm mb-3">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(goal)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {goal.progress}%</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateProgress(goal.id, goal.progress - 5)}
                            disabled={goal.progress <= 0}
                          >
                            -5%
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateProgress(goal.id, goal.progress + 5)}
                            disabled={goal.progress >= 100}
                          >
                            +5%
                          </Button>
                        </div>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                      {goal.targetDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()} 
                          {daysUntil > 0 && ` (${daysUntil} days left)`}
                          {daysUntil < 0 && ` (${Math.abs(daysUntil)} days overdue)`}
                          {daysUntil === 0 && ' (Due today!)'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Set your first goal to start tracking your progress!
              </p>
              <Button onClick={startCreating}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
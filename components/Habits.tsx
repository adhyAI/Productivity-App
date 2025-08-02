import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Flame } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  lastCompleted: Date | null;
  createdAt: Date;
}

export function Habits() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Drink 8 glasses of water',
      streak: 5,
      completedToday: true,
      lastCompleted: new Date(),
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Read for 30 minutes',
      streak: 12,
      completedToday: false,
      lastCompleted: new Date(Date.now() - 86400000), // Yesterday
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Exercise',
      streak: 3,
      completedToday: false,
      lastCompleted: new Date(Date.now() - 86400000),
      createdAt: new Date()
    }
  ]);
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.trim(),
        streak: 0,
        completedToday: false,
        lastCompleted: null,
        createdAt: new Date()
      };
      setHabits([habit, ...habits]);
      setNewHabit('');
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const today = new Date();
        const wasCompletedToday = habit.completedToday;
        
        if (wasCompletedToday) {
          // Unchecking - reduce streak if it was completed today
          return {
            ...habit,
            completedToday: false,
            streak: Math.max(0, habit.streak - 1),
            lastCompleted: habit.streak > 1 ? new Date(Date.now() - 86400000) : null
          };
        } else {
          // Checking - increase streak
          return {
            ...habit,
            completedToday: true,
            streak: habit.streak + 1,
            lastCompleted: today
          };
        }
      }
      return habit;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addHabit();
    }
  };

  const completedToday = habits.filter(habit => habit.completedToday).length;
  const totalHabits = habits.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Daily Habits
          <span className="text-sm text-muted-foreground">
            {completedToday}/{totalHabits} completed today
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addHabit} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={habit.completedToday}
                onCheckedChange={() => toggleHabit(habit.id)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      habit.completedToday
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {habit.name}
                  </span>
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-500">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-medium">{habit.streak}</span>
                    </div>
                  )}
                </div>
                {habit.streak > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {habit.streak} day streak
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteHabit(habit.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No habits yet. Add one above to start building good habits!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
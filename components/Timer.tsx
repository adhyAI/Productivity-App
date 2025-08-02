import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

type TimerMode = 'work' | 'break' | 'longBreak';

interface TimerSession {
  id: string;
  mode: TimerMode;
  duration: number;
  completedAt: Date;
}

export function Timer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [workSessionsToday, setWorkSessionsToday] = useState(2);
  const intervalRef = useRef<NodeJS.Timeout>();

  const durations = {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60
  };

  const modeLabels = {
    work: 'Focus Time',
    break: 'Short Break',
    longBreak: 'Long Break'
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Add completed session
    const session: TimerSession = {
      id: Date.now().toString(),
      mode,
      duration: durations[mode],
      completedAt: new Date()
    };
    setSessions(prev => [session, ...prev]);

    if (mode === 'work') {
      setWorkSessionsToday(prev => prev + 1);
    }

    // Auto-switch to appropriate break mode
    if (mode === 'work') {
      const nextMode = workSessionsToday % 4 === 0 ? 'longBreak' : 'break';
      setMode(nextMode);
      setTimeLeft(durations[nextMode]);
    } else {
      setMode('work');
      setTimeLeft(durations.work);
    }

    // Browser notification (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${modeLabels[mode]} completed!`, {
        body: mode === 'work' ? 'Time for a break!' : 'Ready to focus again?',
        icon: '/favicon.ico'
      });
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pomodoro Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(modeLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={mode === key ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode(key as TimerMode)}
                disabled={isRunning}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-muted-foreground">
              {modeLabels[mode]} • {Math.floor(durations[mode] / 60)} minutes
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              size="lg"
              className="px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completed Sessions</span>
              <span className="font-medium">{workSessionsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Focus Time</span>
              <span className="font-medium">{workSessionsToday * 25} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      session.mode === 'work' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm">{modeLabels[session.mode]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {session.completedAt.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
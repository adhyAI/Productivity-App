import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Plus, Trash2, Mail, Loader2, X, CheckSquare } from 'lucide-react';
import { getStoredToken, getRecentEmails, type GmailMessage } from '../lib/google';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review daily goals', completed: false, createdAt: new Date() },
    { id: '2', text: 'Complete project proposal', completed: true, createdAt: new Date() },
    { id: '3', text: 'Schedule team meeting', completed: false, createdAt: new Date() }
  ]);
  const [newTodo, setNewTodo] = useState('');

  // Gmail import state
  const [showGmailImport, setShowGmailImport] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  // ── Gmail import ──────────────────────────────────────────────────────────

  const openGmailImport = async () => {
    const token = getStoredToken();
    if (!token) {
      setGmailError('Google account not connected. Go to Settings → Integrations.');
      setShowGmailImport(true);
      return;
    }
    setShowGmailImport(true);
    setGmailError(null);
    setSelectedEmailIds(new Set());
    setLoadingGmail(true);
    try {
      const msgs = await getRecentEmails(token, 20);
      setGmailMessages(msgs);
    } catch (e) {
      setGmailError(e instanceof Error ? e.message : 'Failed to load emails');
    } finally {
      setLoadingGmail(false);
    }
  };

  const toggleEmailSelection = (id: string) => {
    setSelectedEmailIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const importSelectedAsTasks = () => {
    const selected = gmailMessages.filter(m => selectedEmailIds.has(m.id));
    const newTasks: Todo[] = selected.map(m => ({
      id: `gmail-${m.id}`,
      text: m.subject,
      completed: false,
      createdAt: new Date(),
    }));
    setTodos(prev => [...newTasks, ...prev]);
    setShowGmailImport(false);
    setSelectedEmailIds(new Set());
    setGmailMessages([]);
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>
            Tasks
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {completedCount}/{totalCount} completed
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={openGmailImport}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Import from Gmail
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gmail import panel */}
        {showGmailImport && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recent Inbox Emails
              </p>
              <button onClick={() => setShowGmailImport(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {gmailError && (
              <p className="text-sm text-destructive">{gmailError}</p>
            )}

            {loadingGmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading emails...
              </div>
            )}

            {!loadingGmail && !gmailError && gmailMessages.length === 0 && (
              <p className="text-sm text-muted-foreground">No emails found.</p>
            )}

            {!loadingGmail && gmailMessages.length > 0 && (
              <>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {gmailMessages.map(msg => (
                    <label
                      key={msg.id}
                      className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                        selectedEmailIds.has(msg.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-background'
                      }`}
                    >
                      <Checkbox
                        checked={selectedEmailIds.has(msg.id)}
                        onCheckedChange={() => toggleEmailSelection(msg.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{msg.from}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{msg.snippet}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {selectedEmailIds.size} selected
                  </span>
                  <Button
                    size="sm"
                    onClick={importSelectedAsTasks}
                    disabled={selectedEmailIds.size === 0}
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Add as Tasks ({selectedEmailIds.size})
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Add task input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addTodo} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Task list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span
                className={`flex-1 ${
                  todo.completed
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {todo.text}
              </span>
              {todo.id.startsWith('gmail-') && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 shrink-0">
                  <Mail className="h-2.5 w-2.5" /> Gmail
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo(todo.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. Add one above to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

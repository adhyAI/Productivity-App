import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Meeting Notes',
      content: 'Discussed project timeline and deliverables. Next steps: finalize requirements by Friday.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Ideas',
      content: 'Brainstorming session ideas for the new product feature. Consider user feedback and market research.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const startCreating = () => {
    setIsCreating(true);
    setNewTitle('');
    setNewContent('');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const saveNote = () => {
    if (newTitle.trim() || newContent.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newTitle.trim() || 'Untitled',
        content: newContent.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([note, ...notes]);
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

  const updateNote = () => {
    if (editingId) {
      setNotes(notes.map(note =>
        note.id === editingId
          ? {
              ...note,
              title: newTitle.trim() || 'Untitled',
              content: newContent.trim(),
              updatedAt: new Date()
            }
          : note
      ));
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Notes
          <Button onClick={startCreating} size="sm" disabled={isCreating}>
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreating && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <Input
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={saveNote} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={cancelCreating} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={updateNote} size="sm">
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
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{note.title}</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated {note.updatedAt.toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          ))}

          {notes.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              No notes yet. Create your first note to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
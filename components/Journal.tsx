import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Calendar as CalendarIcon, Search, Smile, Meh, Frown, Star } from 'lucide-react';

type Mood = 'great' | 'good' | 'okay' | 'bad' | 'awful';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'Great start to the week',
      content: 'Had a wonderful morning walk and felt really energized. Completed all my tasks for the day and even had time to read a book. Feeling grateful for this productive day.',
      mood: 'great',
      tags: ['productive', 'grateful', 'energy'],
      date: '2025-02-01',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Reflections on learning',
      content: 'Spent time learning React today. It\'s challenging but rewarding. Made some progress on my personal project. Looking forward to seeing how it develops.',
      mood: 'good',
      tags: ['learning', 'react', 'project'],
      date: '2025-01-31',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'okay' as Mood,
    tags: [] as string[],
    date: new Date().toISOString().split('T')[0]
  });
  const [newTag, setNewTag] = useState('');

  const moodConfig = {
    great: { label: 'Great', icon: Star, color: 'bg-green-100 text-green-800' },
    good: { label: 'Good', icon: Smile, color: 'bg-blue-100 text-blue-800' },
    okay: { label: 'Okay', icon: Meh, color: 'bg-yellow-100 text-yellow-800' },
    bad: { label: 'Bad', icon: Frown, color: 'bg-orange-100 text-orange-800' },
    awful: { label: 'Awful', icon: Frown, color: 'bg-red-100 text-red-800' }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: 'okay',
      tags: [],
      date: new Date().toISOString().split('T')[0]
    });
    setNewTag('');
  };

  const startCreating = () => {
    setIsCreating(true);
    resetForm();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    resetForm();
  };

  const addTagToForm = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTagFromForm = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const saveEntry = () => {
    if (formData.title.trim() && formData.content.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        mood: formData.mood,
        tags: formData.tags,
        date: formData.date,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setEntries(prev => [entry, ...prev]);
      setIsCreating(false);
      resetForm();
    }
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: [...entry.tags],
      date: entry.date
    });
  };

  const updateEntry = () => {
    if (editingId && formData.title.trim() && formData.content.trim()) {
      setEntries(entries.map(entry =>
        entry.id === editingId
          ? {
              ...entry,
              title: formData.title.trim(),
              content: formData.content.trim(),
              mood: formData.mood,
              tags: formData.tags,
              date: formData.date,
              updatedAt: new Date()
            }
          : entry
      ));
      setEditingId(null);
      resetForm();
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
    
    return matchesSearch && matchesMood;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const allTags = Array.from(new Set(entries.flatMap(entry => entry.tags)));

  const getMoodStats = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as { [key in Mood]?: number });
    
    return moodCounts;
  };

  const moodStats = getMoodStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Journal
            </div>
            <Button onClick={startCreating} size="sm" disabled={isCreating}>
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{entries.length}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
            {Object.entries(moodStats).map(([mood, count]) => {
              const MoodIcon = moodConfig[mood as Mood].icon;
              return (
                <div key={mood} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MoodIcon className="h-4 w-4" />
                    <div className="text-lg font-bold">{count}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {moodConfig[mood as Mood].label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedMoodFilter} onValueChange={setSelectedMoodFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All moods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All moods</SelectItem>
                {Object.entries(moodConfig).map(([mood, { label }]) => (
                  <SelectItem key={mood} value={mood}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Popular Tags */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Popular Tags</h4>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 10).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* New Entry Form */}
          {isCreating && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Entry title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Select value={formData.mood} onValueChange={(value: Mood) => 
                    setFormData(prev => ({ ...prev, mood: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodConfig).map(([mood, { label, icon: Icon }]) => (
                        <SelectItem key={mood} value={mood}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <Textarea
                placeholder="Write your thoughts..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTagToForm()}
                  />
                  <Button onClick={addTagToForm} size="sm" type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTagFromForm(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEntry} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Save Entry
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

      {/* Entries */}
      <div className="space-y-4">
        {sortedEntries.map((entry) => {
          const isEditing = editingId === entry.id;
          const MoodIcon = moodConfig[entry.mood].icon;

          return (
            <Card key={entry.id}>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Select value={formData.mood} onValueChange={(value: Mood) => 
                          setFormData(prev => ({ ...prev, mood: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(moodConfig).map(([mood, { label, icon: Icon }]) => (
                              <SelectItem key={mood} value={mood}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTagToForm()}
                        />
                        <Button onClick={addTagToForm} size="sm" type="button">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                onClick={() => removeTagFromForm(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={updateEntry} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
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
                          <h3 className="text-lg font-medium">{entry.title}</h3>
                          <Badge className={moodConfig[entry.mood].color}>
                            <MoodIcon className="h-3 w-3 mr-1" />
                            {moodConfig[entry.mood].label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {entry.content}
                      </p>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => setSearchTerm(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {sortedEntries.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-12">
              {searchTerm || selectedMoodFilter !== 'all' ? (
                <>
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No entries found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or mood filter
                  </p>
                  <Button 
                    onClick={() => { setSearchTerm(''); setSelectedMoodFilter('all'); }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start writing to capture your thoughts and experiences!
                  </p>
                  <Button onClick={startCreating}>
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Entry
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
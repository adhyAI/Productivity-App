import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, Save, X, HardDrive, ExternalLink, Loader2, Search } from 'lucide-react';
import { getStoredToken, listDriveFiles, type DriveFile } from '../lib/google';

interface DriveAttachment {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  attachments: DriveAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

function mimeTypeIcon(mimeType: string): string {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('folder')) return '📁';
  return '📎';
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Meeting Notes',
      content: 'Discussed project timeline and deliverables. Next steps: finalize requirements by Friday.',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Ideas',
      content: 'Brainstorming session ideas for the new product feature. Consider user feedback and market research.',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Drive picker state (per note being edited/created)
  const [showDrivePicker, setShowDrivePicker] = useState<'creating' | string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveQuery, setDriveQuery] = useState('');
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Draft attachments for the currently-open form
  const [draftAttachments, setDraftAttachments] = useState<DriveAttachment[]>([]);

  // ── Note CRUD ──────────────────────────────────────────────────────────────

  const startCreating = () => {
    setIsCreating(true);
    setNewTitle('');
    setNewContent('');
    setDraftAttachments([]);
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
    setDraftAttachments([]);
    setShowDrivePicker(null);
  };

  const saveNote = () => {
    if (newTitle.trim() || newContent.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newTitle.trim() || 'Untitled',
        content: newContent.trim(),
        attachments: draftAttachments,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([note, ...notes]);
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      setDraftAttachments([]);
      setShowDrivePicker(null);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
    setDraftAttachments([...note.attachments]);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setDraftAttachments([]);
    setShowDrivePicker(null);
  };

  const updateNote = () => {
    if (editingId) {
      setNotes(notes.map(note =>
        note.id === editingId
          ? {
              ...note,
              title: newTitle.trim() || 'Untitled',
              content: newContent.trim(),
              attachments: draftAttachments,
              updatedAt: new Date()
            }
          : note
      ));
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      setDraftAttachments([]);
      setShowDrivePicker(null);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const removeAttachmentFromNote = (noteId: string, fileId: string) => {
    setNotes(notes.map(n =>
      n.id === noteId
        ? { ...n, attachments: n.attachments.filter(a => a.id !== fileId), updatedAt: new Date() }
        : n
    ));
  };

  // ── Drive picker ────────────────────────────────────────────────────────────

  const openDrivePicker = async (context: 'creating' | string) => {
    const token = getStoredToken();
    if (!token) {
      setDriveError('Google account not connected. Go to Settings → Integrations.');
      setShowDrivePicker(context);
      setDriveFiles([]);
      return;
    }
    setShowDrivePicker(context);
    setDriveError(null);
    setDriveQuery('');
    setLoadingDrive(true);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (e) {
      setDriveError(e instanceof Error ? e.message : 'Failed to load Drive files');
    } finally {
      setLoadingDrive(false);
    }
  };

  const searchDrive = async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoadingDrive(true);
    try {
      const query = driveQuery.trim() ? `name contains '${driveQuery}'` : undefined;
      const files = await listDriveFiles(token, query);
      setDriveFiles(files);
    } catch (e) {
      setDriveError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoadingDrive(false);
    }
  };

  const attachFile = (file: DriveFile) => {
    const attachment: DriveAttachment = {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink,
      mimeType: file.mimeType,
    };
    setDraftAttachments(prev =>
      prev.some(a => a.id === file.id) ? prev : [...prev, attachment]
    );
    setShowDrivePicker(null);
  };

  const removeDraftAttachment = (fileId: string) => {
    setDraftAttachments(prev => prev.filter(a => a.id !== fileId));
  };

  // ── Drive picker UI (reusable for create & edit forms) ──────────────────────

  const DrivePickerPanel = ({ context }: { context: 'creating' | string }) => (
    <div className="p-3 border rounded-lg bg-background space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
          <HardDrive className="h-4 w-4" /> Select Drive File
        </p>
        <button onClick={() => setShowDrivePicker(null)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {driveError && <p className="text-sm text-destructive">{driveError}</p>}

      {!driveError && (
        <div className="flex gap-2">
          <Input
            placeholder="Search files..."
            value={driveQuery}
            onChange={e => setDriveQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchDrive()}
            className="flex-1 h-8 text-sm"
          />
          <Button size="sm" variant="outline" onClick={searchDrive} disabled={loadingDrive} className="h-8 px-2">
            {loadingDrive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </Button>
        </div>
      )}

      {loadingDrive && driveFiles.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading files...
        </div>
      )}

      {!loadingDrive && !driveError && driveFiles.length === 0 && (
        <p className="text-sm text-muted-foreground">No files found.</p>
      )}

      <div className="max-h-48 overflow-y-auto space-y-1">
        {driveFiles.map(file => {
          const alreadyAttached = draftAttachments.some(a => a.id === file.id);
          return (
            <button
              key={file.id}
              disabled={alreadyAttached}
              onClick={() => attachFile(file)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                alreadyAttached
                  ? 'text-muted-foreground cursor-default'
                  : 'hover:bg-accent cursor-pointer'
              }`}
            >
              <span>{mimeTypeIcon(file.mimeType)}</span>
              <span className="flex-1 truncate">{file.name}</span>
              {alreadyAttached && <Badge variant="outline" className="text-xs">Added</Badge>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Attachments chips ────────────────────────────────────────────────────────

  const AttachmentChips = ({
    attachments,
    onRemove
  }: {
    attachments: DriveAttachment[];
    onRemove: (id: string) => void;
  }) => (
    <div className="flex flex-wrap gap-1.5">
      {attachments.map(a => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs border"
        >
          <span>{mimeTypeIcon(a.mimeType)}</span>
          <a
            href={a.webViewLink}
            target="_blank"
            rel="noreferrer"
            className="hover:underline max-w-[120px] truncate"
          >
            {a.name}
          </a>
          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
          <button
            onClick={() => onRemove(a.id)}
            className="text-muted-foreground hover:text-destructive ml-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
    </div>
  );

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
            {/* Draft attachments */}
            {draftAttachments.length > 0 && (
              <AttachmentChips
                attachments={draftAttachments}
                onRemove={removeDraftAttachment}
              />
            )}
            {/* Drive picker */}
            {showDrivePicker === 'creating' && <DrivePickerPanel context="creating" />}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={saveNote} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={cancelCreating} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={() => openDrivePicker('creating')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground"
              >
                <HardDrive className="h-3.5 w-3.5" />
                Attach Drive file
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
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
                  {/* Draft attachments */}
                  {draftAttachments.length > 0 && (
                    <AttachmentChips
                      attachments={draftAttachments}
                      onRemove={removeDraftAttachment}
                    />
                  )}
                  {/* Drive picker */}
                  {showDrivePicker === note.id && <DrivePickerPanel context={note.id} />}
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={updateNote} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => openDrivePicker(note.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-muted-foreground"
                    >
                      <HardDrive className="h-3.5 w-3.5" />
                      Attach Drive file
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
                  {/* Attachments display */}
                  {note.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {note.attachments.map(a => (
                        <a
                          key={a.id}
                          href={a.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs border hover:bg-accent transition-colors"
                        >
                          <span>{mimeTypeIcon(a.mimeType)}</span>
                          <span className="max-w-[120px] truncate">{a.name}</span>
                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                        </a>
                      ))}
                      <button
                        onClick={() => startEditing(note)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-full transition-colors"
                      >
                        <HardDrive className="h-2.5 w-2.5" /> Edit attachments
                      </button>
                    </div>
                  )}
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

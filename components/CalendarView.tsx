import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { getStoredToken, getCalendarEvents, type CalendarEvent } from '../lib/google';
import {
  CalendarDays, MapPin, Clock, ExternalLink, RefreshCw,
  Loader2, AlertCircle, Calendar
} from 'lucide-react';

interface CalendarViewProps {
  setActiveTab?: (tab: string) => void;
}

function formatEventTime(event: CalendarEvent): string {
  const start = event.start.dateTime ?? event.start.date;
  if (!start) return '';
  if (event.start.date && !event.start.dateTime) {
    // All-day event
    return 'All day';
  }
  return new Date(start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatEventDate(event: CalendarEvent): string {
  const start = event.start.dateTime ?? event.start.date;
  if (!start) return '';
  const d = new Date(start);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(event: CalendarEvent): string {
  const startStr = event.start.dateTime;
  const endStr = event.end.dateTime;
  if (!startStr || !endStr) return '';
  const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Group events by date label
function groupEvents(events: CalendarEvent[]): { label: string; events: CalendarEvent[] }[] {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const label = formatEventDate(e);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(e);
  }
  return Array.from(map.entries()).map(([label, evts]) => ({ label, events: evts }));
}

export function CalendarView({ setActiveTab }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadEvents = async () => {
    const token = getStoredToken();
    if (!token) { setIsConnected(false); return; }
    setIsConnected(true);
    setLoading(true);
    setError(null);
    try {
      const data = await getCalendarEvents(token, 15);
      setEvents(data);
      setLastRefreshed(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const groups = groupEvents(events);

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">Your upcoming Google Calendar events</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="h-14 w-14 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Google Calendar not connected</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Connect your Google account to see upcoming events here.
            </p>
            {setActiveTab && (
              <Button onClick={() => setActiveTab('settings')}>
                Go to Settings → Integrations
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            {lastRefreshed && `Last updated ${lastRefreshed.toLocaleTimeString()}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading} className="flex items-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      {loading && events.length === 0 && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Loading events...</p>
          </CardContent>
        </Card>
      )}

      {!loading && events.length === 0 && !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No upcoming events</p>
            <p className="text-muted-foreground text-sm mt-1">Your next 15 events will appear here.</p>
          </CardContent>
        </Card>
      )}

      {groups.map(({ label, events: groupEvts }, gi) => (
        <div key={label} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={label === 'Today' ? 'default' : 'outline'} className="text-xs">
              {label}
            </Badge>
            <Separator className="flex-1" />
          </div>

          {groupEvts.map((event, i) => {
            const duration = formatDuration(event);
            const time = formatEventTime(event);
            return (
              <Card key={event.id} className={`transition-colors hover:border-primary/50 ${gi === 0 && i === 0 ? 'border-primary/30' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-sm">{event.summary || '(No title)'}</h4>
                        {gi === 0 && i === 0 && (
                          <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Next up</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {time}
                            {duration && ` · ${duration}`}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      title="Open in Google Calendar"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}

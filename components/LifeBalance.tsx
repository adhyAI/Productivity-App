import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from './ui/select';
import {
  Circle, CheckCircle2, ChevronRight, ChevronLeft,
  Plus, Trash2, History, Target, ClipboardList, Grid2X2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type LifeArea =
  | 'health'
  | 'career'
  | 'finances'
  | 'relationships'
  | 'growth'
  | 'fun'
  | 'environment'
  | 'purpose';

interface WheelSnapshot {
  id: string;
  date: string;
  scores: Record<LifeArea, number>;
  createdAt: string;
}

interface WeeklyReview {
  id: string;
  weekStartDate: string;
  step1Capture: string;
  step2WheelScores: Record<LifeArea, number>;
  step3GotDone: string;
  step3DidntDo: string;
  step3EnergyDrains: string;
  step3Energizers: string;
  step4Outcome1: string;
  step4Outcome2: string;
  step4Outcome3: string;
  step5ValuesReflection: string;
  completedAt: string | null;
  createdAt: string;
}

interface MatrixTask {
  id: string;
  text: string;
  quadrant: 'do-now' | 'schedule' | 'delegate' | 'eliminate';
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIFE_AREAS: { id: LifeArea; label: string; description: string; color: string }[] = [
  { id: 'health',        label: 'Health & Fitness',      description: 'Physical health, exercise, sleep, nutrition', color: '#10b981' },
  { id: 'career',        label: 'Career & Work',          description: 'Work satisfaction, growth, contribution',     color: '#3b82f6' },
  { id: 'finances',      label: 'Money & Finances',       description: 'Financial security, savings, income',         color: '#f59e0b' },
  { id: 'relationships', label: 'Relationships',           description: 'Family, friends, romance, social life',       color: '#ec4899' },
  { id: 'growth',        label: 'Personal Growth',         description: 'Learning, skills, mindset, creativity',       color: '#8b5cf6' },
  { id: 'fun',           label: 'Fun & Recreation',        description: 'Hobbies, leisure, joy, play',                 color: '#f97316' },
  { id: 'environment',   label: 'Environment',             description: 'Home, workspace, surroundings',               color: '#06b6d4' },
  { id: 'purpose',       label: 'Purpose & Contribution',  description: 'Meaning, giving back, legacy',                color: '#6366f1' },
];

const DEFAULT_SCORES: Record<LifeArea, number> = {
  health: 5, career: 5, finances: 5, relationships: 5,
  growth: 5, fun: 5, environment: 5, purpose: 5,
};

const QUADRANT_CONFIG = {
  'do-now':    { label: 'Do Now',    subtitle: 'Urgent + Important',     borderClass: 'border-red-500',    bgClass: 'bg-red-50 dark:bg-red-950/20',    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  'schedule':  { label: 'Schedule',  subtitle: 'Not Urgent + Important', borderClass: 'border-blue-500',   bgClass: 'bg-blue-50 dark:bg-blue-950/20',  badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  'delegate':  { label: 'Delegate',  subtitle: 'Urgent + Not Important', borderClass: 'border-yellow-500', bgClass: 'bg-yellow-50 dark:bg-yellow-950/20', badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  'eliminate': { label: 'Eliminate', subtitle: 'Not Urgent + Not Important', borderClass: 'border-gray-400', bgClass: 'bg-gray-50 dark:bg-gray-900/30', badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getThisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function avgScore(scores: Record<LifeArea, number>): number {
  const vals = Object.values(scores);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function blankReviewDraft(): Omit<WeeklyReview, 'id' | 'createdAt' | 'completedAt'> {
  return {
    weekStartDate: getThisMonday(),
    step1Capture: '',
    step2WheelScores: { ...DEFAULT_SCORES },
    step3GotDone: '',
    step3DidntDo: '',
    step3EnergyDrains: '',
    step3Energizers: '',
    step4Outcome1: '',
    step4Outcome2: '',
    step4Outcome3: '',
    step5ValuesReflection: '',
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LifeBalance() {
  // ── Wheel of Life state ──
  const [snapshots, setSnapshots] = useState<WheelSnapshot[]>([]);
  const [currentScores, setCurrentScores] = useState<Record<LifeArea, number>>(DEFAULT_SCORES);
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [draftScores, setDraftScores] = useState<Record<LifeArea, number>>(DEFAULT_SCORES);

  // ── Weekly Review state ──
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [isCreatingReview, setIsCreatingReview] = useState(false);
  const [reviewStep, setReviewStep] = useState(1);
  const [reviewDraft, setReviewDraft] = useState<Omit<WeeklyReview, 'id' | 'createdAt' | 'completedAt'>>(blankReviewDraft());
  const [viewingReviewId, setViewingReviewId] = useState<string | null>(null);

  // ── Eisenhower Matrix state ──
  const [matrixTasks, setMatrixTasks] = useState<MatrixTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskQuadrant, setNewTaskQuadrant] = useState<MatrixTask['quadrant']>('do-now');

  // ── localStorage: wheel ──
  useEffect(() => {
    const saved = localStorage.getItem('productivity-app-wheel-snapshots');
    if (saved) {
      try {
        const parsed: WheelSnapshot[] = JSON.parse(saved);
        setSnapshots(parsed);
        if (parsed.length > 0) setCurrentScores(parsed[parsed.length - 1].scores);
      } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('productivity-app-wheel-snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  // ── localStorage: reviews ──
  useEffect(() => {
    const saved = localStorage.getItem('productivity-app-weekly-reviews');
    if (saved) {
      try { setReviews(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('productivity-app-weekly-reviews', JSON.stringify(reviews));
  }, [reviews]);

  // ── localStorage: matrix ──
  useEffect(() => {
    const saved = localStorage.getItem('productivity-app-matrix-tasks');
    if (saved) {
      try { setMatrixTasks(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('productivity-app-matrix-tasks', JSON.stringify(matrixTasks));
  }, [matrixTasks]);

  // ── Wheel helpers ──
  const sortedByScore = [...LIFE_AREAS].sort((a, b) => currentScores[a.id] - currentScores[b.id]);
  const lowestTwo = new Set([sortedByScore[0].id, sortedByScore[1].id]);

  const radarData = LIFE_AREAS.map(area => ({
    area: area.label,
    score: currentScores[area.id],
    fullMark: 10,
  }));

  const startEditingScores = () => {
    setDraftScores({ ...currentScores });
    setIsEditingScores(true);
  };

  const saveSnapshot = () => {
    const snapshot: WheelSnapshot = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      scores: { ...draftScores },
      createdAt: new Date().toISOString(),
    };
    setSnapshots(prev => [...prev, snapshot]);
    setCurrentScores({ ...draftScores });
    setIsEditingScores(false);
  };

  // ── Review helpers ──
  const startNewReview = () => {
    setReviewDraft(blankReviewDraft());
    setReviewStep(1);
    setViewingReviewId(null);
    setIsCreatingReview(true);
  };

  const saveReview = () => {
    const review: WeeklyReview = {
      id: Date.now().toString(),
      ...reviewDraft,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [review, ...prev]);
    setIsCreatingReview(false);
    setReviewStep(1);
  };

  // ── Matrix helpers ──
  const addMatrixTask = () => {
    if (!newTaskText.trim()) return;
    const task: MatrixTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      quadrant: newTaskQuadrant,
      createdAt: new Date().toISOString(),
    };
    setMatrixTasks(prev => [...prev, task]);
    setNewTaskText('');
  };

  const deleteMatrixTask = (id: string) => {
    setMatrixTasks(prev => prev.filter(t => t.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const viewingReview = viewingReviewId ? reviews.find(r => r.id === viewingReviewId) : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Life Balance</h1>
        <p className="text-muted-foreground mt-1">
          Ali Abdaal's Feel-Good Productivity framework — Wheel of Life, Weekly Review & Prioritization
        </p>
      </div>

      <Tabs defaultValue="wheel">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wheel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Wheel of Life
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Weekly Review
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid2X2 className="h-4 w-4" />
            Priority Matrix
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: WHEEL OF LIFE
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="wheel" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Your Life Balance Wheel</CardTitle>
                <CardDescription>
                  Average score: <strong>{avgScore(currentScores)}/10</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={420}>
                  <RadarChart data={radarData} outerRadius="65%" margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={6} tick={{ fontSize: 9 }} />
                    <Radar
                      name="Life Balance"
                      dataKey="score"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.3}
                    />
                    <Tooltip formatter={(value: number) => [`${value}/10`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scores panel */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Area Scores</CardTitle>
                  <CardDescription>Rate each area 1–10. Focus Areas are your lowest 2.</CardDescription>
                </div>
                {!isEditingScores ? (
                  <Button onClick={startEditingScores} size="sm">Update Scores</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingScores(false)}>Cancel</Button>
                    <Button size="sm" onClick={saveSnapshot}>Save</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                {LIFE_AREAS.map(area => (
                  <div key={area.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{area.label}</span>
                          {lowestTwo.has(area.id) && (
                            <Badge variant="destructive" className="text-xs">Focus Area</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{area.description}</p>
                      </div>
                      <span className="text-lg font-bold shrink-0" style={{ color: area.color }}>
                        {isEditingScores ? draftScores[area.id] : currentScores[area.id]}/10
                      </span>
                    </div>
                    {isEditingScores && (
                      <Slider
                        value={[draftScores[area.id]]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={([val]) =>
                          setDraftScores(prev => ({ ...prev, [area.id]: val }))
                        }
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Focus Area Insights */}
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="text-base">Focus Area Insights</CardTitle>
              <CardDescription>Your 2 lowest-scoring areas — small wins here create the most momentum</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[sortedByScore[0], sortedByScore[1]].map(area => (
                <div key={area.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{area.label}</span>
                    <Badge variant="outline" style={{ borderColor: area.color, color: area.color }}>
                      {currentScores[area.id]}/10
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    What's one small action you could take this week to improve this area?
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Snapshot history */}
          {snapshots.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  Score History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...snapshots].reverse().map(snap => (
                    <div key={snap.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{formatDate(snap.date)}</span>
                      <Badge variant="outline">Avg {avgScore(snap.scores)}/10</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: WEEKLY REVIEW
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="review" className="space-y-6 mt-6">
          {/* ── Creating a new review ── */}
          {isCreatingReview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Review</CardTitle>
                    <CardDescription>Step {reviewStep} of 5</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreatingReview(false)}>Cancel</Button>
                </div>
                {/* Progress dots */}
                <div className="flex gap-2 pt-2">
                  {[1,2,3,4,5].map(s => (
                    <div
                      key={s}
                      className={`h-2 flex-1 rounded-full transition-colors ${s <= reviewStep ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {reviewStep === 1 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 1: Capture & Clear</h3>
                      <p className="text-sm text-muted-foreground">
                        Empty your head. Write down every loose thought, task, or idea that's been floating around.
                      </p>
                    </div>
                    <Textarea
                      placeholder="Brain dump everything here — tasks, ideas, worries, things to follow up on..."
                      className="min-h-[160px]"
                      value={reviewDraft.step1Capture}
                      onChange={e => setReviewDraft(d => ({ ...d, step1Capture: e.target.value }))}
                    />
                  </div>
                )}

                {reviewStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 2: Wheel Check</h3>
                      <p className="text-sm text-muted-foreground">
                        Quick gut-check. How did each life area feel this week? Rate 1–5.
                      </p>
                    </div>
                    {LIFE_AREAS.map(area => (
                      <div key={area.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{area.label}</span>
                          <span className="text-sm font-bold" style={{ color: area.color }}>
                            {reviewDraft.step2WheelScores[area.id]}/5
                          </span>
                        </div>
                        <Slider
                          value={[reviewDraft.step2WheelScores[area.id]]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={([val]) =>
                            setReviewDraft(d => ({
                              ...d,
                              step2WheelScores: { ...d.step2WheelScores, [area.id]: val }
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {reviewStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 3: Look Back</h3>
                      <p className="text-sm text-muted-foreground">Reflect on the week that just passed.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">What did I accomplish this week?</label>
                      <Textarea
                        placeholder="Wins, big and small..."
                        className="min-h-[80px]"
                        value={reviewDraft.step3GotDone}
                        onChange={e => setReviewDraft(d => ({ ...d, step3GotDone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">What didn't get done? Why?</label>
                      <Textarea
                        placeholder="Be honest, not harsh..."
                        className="min-h-[80px]"
                        value={reviewDraft.step3DidntDo}
                        onChange={e => setReviewDraft(d => ({ ...d, step3DidntDo: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">What drained my energy?</label>
                        <Textarea
                          placeholder="Activities, people, situations..."
                          className="min-h-[80px]"
                          value={reviewDraft.step3EnergyDrains}
                          onChange={e => setReviewDraft(d => ({ ...d, step3EnergyDrains: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">What gave me energy?</label>
                        <Textarea
                          placeholder="Flow states, enjoyable moments..."
                          className="min-h-[80px]"
                          value={reviewDraft.step3Energizers}
                          onChange={e => setReviewDraft(d => ({ ...d, step3Energizers: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {reviewStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 4: Look Forward</h3>
                      <p className="text-sm text-muted-foreground">
                        What are the 3 most important outcomes for next week? (Outcome 3 must be from a non-work area.)
                      </p>
                    </div>
                    <div className="space-y-3">
                      {(['step4Outcome1', 'step4Outcome2', 'step4Outcome3'] as const).map((key, i) => (
                        <div key={key} className="space-y-1">
                          <label className="text-sm font-medium">
                            Outcome {i + 1}{i === 2 ? ' (non-work area)' : ''}
                          </label>
                          <Input
                            placeholder={i === 2
                              ? 'e.g. Go for a hike with family, read 50 pages of a novel...'
                              : 'e.g. Finish the Q2 report, ship the new feature...'}
                            value={reviewDraft[key]}
                            onChange={e => setReviewDraft(d => ({ ...d, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviewStep === 5 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-base mb-1">Step 5: Align</h3>
                      <p className="text-sm text-muted-foreground">
                        Does your plan for next week reflect your values and longer-term goals? Are you making progress in your lowest life area?
                      </p>
                    </div>
                    <Textarea
                      placeholder="Reflect on alignment with your values, purpose, and what really matters to you..."
                      className="min-h-[160px]"
                      value={reviewDraft.step5ValuesReflection}
                      onChange={e => setReviewDraft(d => ({ ...d, step5ValuesReflection: e.target.value }))}
                    />
                  </div>
                )}

                <Separator />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setReviewStep(s => Math.max(1, s - 1))}
                    disabled={reviewStep === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  {reviewStep < 5 ? (
                    <Button
                      onClick={() => setReviewStep(s => s + 1)}
                      className="flex items-center gap-1"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={saveReview} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Complete Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

          ) : viewingReview ? (
            /* ── Viewing a past review ── */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Review</CardTitle>
                    <CardDescription>Week of {formatDate(viewingReview.weekStartDate)}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setViewingReviewId(null)}>Back to list</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {viewingReview.step1Capture && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground uppercase tracking-wide">Captured Thoughts</h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingReview.step1Capture}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Wheel Scores (1–5)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LIFE_AREAS.map(a => (
                      <div key={a.id} className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-xs text-muted-foreground">{a.label}</div>
                        <div className="font-bold" style={{ color: a.color }}>{viewingReview.step2WheelScores[a.id]}/5</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                {viewingReview.step3GotDone && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground uppercase tracking-wide">Accomplished</h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingReview.step3GotDone}</p>
                  </div>
                )}
                {viewingReview.step4Outcome1 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-muted-foreground uppercase tracking-wide">Outcomes Planned</h4>
                    <ul className="space-y-1">
                      {[viewingReview.step4Outcome1, viewingReview.step4Outcome2, viewingReview.step4Outcome3]
                        .filter(Boolean)
                        .map((o, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="mt-0.5 h-4 w-4 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{i+1}</span>
                            {o}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

          ) : (
            /* ── Review list / empty state ── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Weekly Reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    The weekly review is the master key to sustained productivity.
                  </p>
                </div>
                <Button onClick={startNewReview} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Start Review
                </Button>
              </div>

              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mb-6">
                      A weekly review takes 15–30 minutes and gives you clarity for the whole week ahead.
                    </p>
                    <Button onClick={startNewReview}>Start Your First Review</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {reviews.map(review => (
                    <Card key={review.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setViewingReviewId(review.id)}>
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">Week of {formatDate(review.weekStartDate)}</p>
                            <p className="text-xs text-muted-foreground">
                              Avg wheel: {avgScore(review.step2WheelScores)}/5
                              {review.completedAt && ` · Completed ${formatDate(review.completedAt.split('T')[0])}`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: EISENHOWER MATRIX
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="matrix" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Priority Matrix</h2>
              <p className="text-sm text-muted-foreground">
                Most energy should go to "important but not urgent" — that's where growth lives.
              </p>
            </div>
          </div>

          {/* 2×2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.keys(QUADRANT_CONFIG) as MatrixTask['quadrant'][]).map(quadrant => {
              const config = QUADRANT_CONFIG[quadrant];
              const tasks = matrixTasks.filter(t => t.quadrant === quadrant);
              return (
                <Card key={quadrant} className={`border-2 ${config.borderClass}`}>
                  <CardHeader className={`pb-3 ${config.bgClass} rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{config.label}</CardTitle>
                      <Badge className={config.badgeClass}>{tasks.length}</Badge>
                    </div>
                    <CardDescription className="text-xs">{config.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3">
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-2">No tasks here</p>
                    ) : (
                      <ul className="space-y-2">
                        {tasks.map(task => (
                          <li key={task.id} className="flex items-start gap-2 group">
                            <Circle className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                            <span className="text-sm flex-1">{task.text}</span>
                            <button
                              onClick={() => deleteMatrixTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add task form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Describe the task..."
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addMatrixTask()}
                  className="flex-1"
                />
                <Select
                  value={newTaskQuadrant}
                  onValueChange={(v) => setNewTaskQuadrant(v as MatrixTask['quadrant'])}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(QUADRANT_CONFIG) as MatrixTask['quadrant'][]).map(q => (
                      <SelectItem key={q} value={q}>{QUADRANT_CONFIG[q].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addMatrixTask} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-3">Eisenhower Matrix Guide</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div><span className="font-semibold text-red-500">Do Now</span> — Crises, deadlines, urgent problems. Handle immediately.</div>
                <div><span className="font-semibold text-blue-500">Schedule</span> — Planning, learning, relationships. Block time for these.</div>
                <div><span className="font-semibold text-yellow-500">Delegate</span> — Interruptions, some meetings. Can someone else handle this?</div>
                <div><span className="font-semibold text-gray-500">Eliminate</span> — Time wasters, trivial tasks. Stop doing these.</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

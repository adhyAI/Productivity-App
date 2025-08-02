import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Edit2, Trash2, Save, X, CheckCircle2, Clock, AlertTriangle, FolderOpen } from 'lucide-react';

type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  startDate: string;
  dueDate: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design and improved UX',
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      startDate: '2025-01-15',
      dueDate: '2025-03-01',
      tasks: [
        { id: '1', title: 'Design mockups', completed: true },
        { id: '2', title: 'Frontend development', completed: false },
        { id: '3', title: 'Backend integration', completed: false },
        { id: '4', title: 'Testing & deployment', completed: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'Develop iOS and Android app for the productivity platform',
      status: 'planning',
      priority: 'medium',
      progress: 20,
      startDate: '2025-02-01',
      dueDate: '2025-06-01',
      tasks: [
        { id: '1', title: 'Market research', completed: true },
        { id: '2', title: 'Feature specification', completed: false },
        { id: '3', title: 'UI/UX design', completed: false },
        { id: '4', title: 'Development', completed: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Priority,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    tasks: [] as Task[]
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const statusConfig = {
    planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800', icon: Clock },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    review: { label: 'Review', color: 'bg-purple-100 text-purple-800', icon: AlertTriangle },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'on-hold': { label: 'On Hold', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'bg-green-100 text-green-800' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      tasks: []
    });
    setNewTaskTitle('');
  };

  const startCreating = () => {
    setIsCreating(true);
    resetForm();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    resetForm();
  };

  const addTaskToForm = () => {
    if (newTaskTitle.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false
      };
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, task]
      }));
      setNewTaskTitle('');
    }
  };

  const removeTaskFromForm = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const saveProject = () => {
    if (formData.name.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: 'planning',
        priority: formData.priority,
        progress: 0,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        tasks: formData.tasks,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProjects(prev => [project, ...prev]);
      setIsCreating(false);
      resetForm();
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
      tasks: [...project.tasks]
    });
  };

  const updateProject = () => {
    if (editingId && formData.name.trim()) {
      setProjects(projects.map(project =>
        project.id === editingId
          ? {
              ...project,
              name: formData.name.trim(),
              description: formData.description.trim(),
              priority: formData.priority,
              startDate: formData.startDate,
              dueDate: formData.dueDate,
              tasks: formData.tasks,
              updatedAt: new Date()
            }
          : project
      ));
      setEditingId(null);
      resetForm();
    }
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(projects.map(project =>
      project.id === id
        ? { ...project, status, updatedAt: new Date() }
        : project
    ));
  };

  const updateProjectProgress = (id: string, progress: number) => {
    setProjects(projects.map(project =>
      project.id === id
        ? { 
            ...project, 
            progress: Math.max(0, Math.min(100, progress)),
            status: progress >= 100 ? 'completed' : project.status,
            updatedAt: new Date()
          }
        : project
    ));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const updatedTasks = project.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedTasks = updatedTasks.filter(t => t.completed).length;
        const newProgress = updatedTasks.length > 0 ? Math.round((completedTasks / updatedTasks.length) * 100) : 0;
        
        return {
          ...project,
          tasks: updatedTasks,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : project.status,
          updatedAt: new Date()
        };
      }
      return project;
    }));
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const activeProjects = projects.filter(p => p.status !== 'completed');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Project Management
            </div>
            <Button onClick={startCreating} size="sm" disabled={isCreating}>
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{activeProjects.length}</div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedProjects.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </div>
          </div>

          {isCreating && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4 mb-6">
              <Input
                placeholder="Project name..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Project description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={formData.priority} onValueChange={(value: Priority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tasks</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTaskToForm()}
                  />
                  <Button onClick={addTaskToForm} size="sm" type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tasks.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-background rounded border">
                        <span className="text-sm">{task.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTaskFromForm(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveProject} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Create Project
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

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeProjects.map((project) => {
            const daysUntilDue = getDaysUntilDue(project.dueDate);
            const isEditing = editingId === project.id;
            const StatusIcon = statusConfig[project.status].icon;

            return (
              <Card key={project.id}>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select value={formData.priority} onValueChange={(value: Priority) => 
                          setFormData(prev => ({ ...prev, priority: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(priorityConfig).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={updateProject} size="sm">
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
                            <h3 className="text-lg font-medium">{project.name}</h3>
                            <Badge className={priorityConfig[project.priority].color}>
                              {priorityConfig[project.priority].label}
                            </Badge>
                            <Badge className={statusConfig[project.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[project.status].label}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(project)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProject(project.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress: {project.progress}%</span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProjectProgress(project.id, project.progress - 5)}
                                disabled={project.progress <= 0}
                              >
                                -5%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProjectProgress(project.id, project.progress + 5)}
                                disabled={project.progress >= 100}
                              >
                                +5%
                              </Button>
                            </div>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            Due: {new Date(project.dueDate).toLocaleDateString()}
                            {daysUntilDue > 0 && ` (${daysUntilDue} days left)`}
                            {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)} days overdue)`}
                            {daysUntilDue === 0 && ' (Due today!)'}
                          </span>
                          <Select value={project.status} onValueChange={(value: ProjectStatus) => 
                            updateProjectStatus(project.id, value)
                          }>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {project.tasks.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Tasks ({project.tasks.filter(t => t.completed).length}/{project.tasks.length})</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {project.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(project.id, task.id)}
                                    className="rounded"
                                  />
                                  <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {activeProjects.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active projects</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start tracking progress!
                </p>
                <Button onClick={startCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProjects.map((project) => (
            <Card key={project.id} className="opacity-75">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{project.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {project.description && (
                  <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  Completed on {project.updatedAt.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {completedProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed projects yet. Finish some active projects to see them here!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
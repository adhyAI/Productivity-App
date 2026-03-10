import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  signInWithGoogle,
  signOutGoogle,
  getStoredToken,
  getStoredUserInfo,
  getClientId,
  saveClientId,
  type GoogleUserInfo,
} from '../lib/google';
import {
  Calendar, Mail, HardDrive, CheckCircle2, XCircle,
  ExternalLink, Loader2, Key, ChevronDown, ChevronUp, Info
} from 'lucide-react';

const SERVICE_CONFIG = [
  {
    id: 'calendar',
    label: 'Google Calendar',
    description: 'View upcoming events in the Calendar tab',
    icon: Calendar,
    iconColor: 'text-blue-500',
    scope: 'calendar.readonly',
  },
  {
    id: 'gmail',
    label: 'Gmail',
    description: 'Import emails as tasks in the Tasks view',
    icon: Mail,
    iconColor: 'text-red-500',
    scope: 'gmail.readonly',
  },
  {
    id: 'drive',
    label: 'Google Drive',
    description: 'Attach Drive files to notes',
    icon: HardDrive,
    iconColor: 'text-green-500',
    scope: 'drive.readonly',
  },
] as const;

export function Integrations() {
  const [clientIdInput, setClientIdInput] = useState('');
  const [savedClientId, setSavedClientId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const cid = getClientId();
    setSavedClientId(cid);
    if (cid) setClientIdInput(cid);

    const tok = getStoredToken();
    setToken(tok);
    if (tok) setUserInfo(getStoredUserInfo());
  }, []);

  const handleSaveClientId = () => {
    const trimmed = clientIdInput.trim();
    if (!trimmed) return;
    saveClientId(trimmed);
    setSavedClientId(trimmed);
    setError(null);
  };

  const handleConnect = async () => {
    if (!savedClientId) { setError('Please save your Client ID first.'); return; }
    setConnecting(true);
    setError(null);
    try {
      await signInWithGoogle(savedClientId);
      setToken(getStoredToken());
      setUserInfo(getStoredUserInfo());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    signOutGoogle();
    setToken(null);
    setUserInfo(null);
  };

  const isConnected = !!token;

  return (
    <div className="space-y-6">

      {/* Setup Guide */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowGuide(v => !v)}
          >
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4 text-blue-500" />
              Google Cloud Setup Guide
              <Badge variant="outline" className="text-xs">Required once</Badge>
            </CardTitle>
            {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CardHeader>
        {showGuide && (
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              You need a free Google Cloud OAuth Client ID to connect your Google account. Follow these steps:
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>
                Go to{' '}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3" />
                </a>
                {' '}and create a new project.
              </li>
              <li>
                Enable <strong>Gmail API</strong>, <strong>Google Calendar API</strong>, and <strong>Google Drive API</strong> via <em>APIs &amp; Services → Library</em>.
              </li>
              <li>
                Go to <em>APIs &amp; Services → Credentials → Create Credentials → OAuth 2.0 Client ID</em>.
              </li>
              <li>
                Choose <strong>Web application</strong>. Add your app's URL (e.g. <code className="text-xs bg-muted px-1 rounded">http://localhost:3000</code>) to <em>Authorized JavaScript Origins</em>.
              </li>
              <li>Copy the <strong>Client ID</strong> and paste it below.</li>
            </ol>
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs text-amber-700 dark:text-amber-300">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Your Client ID is stored only in your browser (localStorage). Access tokens expire after 1 hour and are not sent anywhere except Google's servers.
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Client ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google OAuth Client ID</CardTitle>
          <CardDescription>
            {savedClientId
              ? 'Client ID saved. You can update it below.'
              : 'Paste your Client ID from Google Cloud Console to enable integrations.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
              value={clientIdInput}
              onChange={e => setClientIdInput(e.target.value)}
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={handleSaveClientId} disabled={!clientIdInput.trim()}>
              Save
            </Button>
          </div>
          {savedClientId && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Client ID saved
            </p>
          )}
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Account</CardTitle>
          <CardDescription>
            One connection grants access to all three services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && userInfo ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">{userInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={connecting || !savedClientId}
                className="flex items-center gap-2"
              >
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                {connecting ? 'Connecting...' : 'Connect Google'}
              </Button>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" /> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICE_CONFIG.map(service => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className={isConnected ? 'border-green-200 dark:border-green-800' : ''}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <Icon className={`h-6 w-6 ${service.iconColor}`} />
                  <Badge
                    variant={isConnected ? 'default' : 'outline'}
                    className={isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                  >
                    {isConnected ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm">{service.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Scope: <code className="bg-muted px-1 rounded">{service.scope}</code>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ClipboardList, Gamepad2, LayoutDashboard, LogOut, Medal, ShieldAlert, Trophy, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { registrationConfig } from '../config/registration';
import '../admin.css';

type Team = { id: string; name: string; points: number };
type Registration = {
  id?: string;
  email?: string;
  name?: string;
  mobile_number?: string;
  team_name?: string;
  business_unit?: string;
  event_name?: string;
  created_at?: string;
  [key: string]: unknown;
};
type AuthStatus = 'loading' | 'unauthenticated' | 'authorized' | 'unauthorized' | 'authorization_error';
type GameResult = {
  game_name: string;
  winner_name: string | null;
  winner_email: string | null;
  winner_team_name: string | null;
  winner_business_unit: string | null;
  runner_up_name: string | null;
  runner_up_email: string | null;
  runner_up_team_name: string | null;
  runner_up_business_unit: string | null;
};
type CaptainDetail = {
  id?: string;
  team_id: string;
  role: 'captain' | 'vice_captain';
  name: string | null;
  email: string | null;
  phone: string | null;
  image_url: string | null;
};

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.26-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.68-3.9 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.11-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

function sortTeams(teams: Team[]) {
  return [...teams].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

export default function AdminApp() {
  const pathname = window.location.pathname;
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [message, setMessage] = useState('');
  const [account, setAccount] = useState<{ email?: string; userId?: string }>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationFilter, setRegistrationFilter] = useState('All Games');
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationSummary, setRegistrationSummary] = useState<{ type: 'business' | 'team' | 'game'; value: string } | null>(null);
  const [editing, setEditing] = useState<Team | null>(null);
  const [points, setPoints] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'registrations' | 'games' | 'captains'>('dashboard');
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [loadingGameResults, setLoadingGameResults] = useState(false);
  const [editingGameResult, setEditingGameResult] = useState<GameResult | null>(null);
  const [winnerResultSearch, setWinnerResultSearch] = useState('');
  const [runnerUpResultSearch, setRunnerUpResultSearch] = useState('');
  const [winnerDropdownOpen, setWinnerDropdownOpen] = useState(false);
  const [runnerUpDropdownOpen, setRunnerUpDropdownOpen] = useState(false);
  const [captains, setCaptains] = useState<CaptainDetail[]>([]);
  const [loadingCaptains, setLoadingCaptains] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState<CaptainDetail | null>(null);
  const savingRef = useRef(false);

  const checkAdmin = async () => {
    if (!supabase) {
      setStatus('unauthenticated');
      setMessage('Supabase is not configured.');
      return;
    }
    setStatus('loading');
    setMessage('');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setStatus('authorization_error');
      setMessage('The authenticated session could not be verified. Please try signing in again.');
      return;
    }
    const session = sessionData.session;
    if (!session?.user) {
      setStatus('unauthenticated');
      return;
    }
    setAccount({ email: session.user.email, userId: session.user.id });
    const { data, error } = await supabase.rpc('is_sports_day_admin');
    if (error) {
      setStatus('authorization_error');
      setMessage('Admin authorization could not be verified because the database authorization query failed.');
      return;
    }
    if (data === true) setStatus('authorized');
    else if (data === false) {
      setStatus('unauthorized');
      setMessage('Your Google account is authenticated, but it is not authorized to manage the leaderboard.');
    }
    else {
      setStatus('authorization_error');
      setMessage('Admin authorization returned an invalid response. Please try again or contact the administrator.');
    }
  };

  const loadTeams = async () => {
    if (!supabase) return;
    setLoadingTeams(true);
    const { data, error } = await supabase.from('sports_day_teams').select('id,name,points').order('name');
    setLoadingTeams(false);
    if (error) setMessage('Team data could not be loaded.');
    else setTeams((data || []) as Team[]);
  };

  const loadRegistrations = async () => {
    if (!supabase) return;
    setLoadingRegistrations(true);
    const { data, error } = await supabase.rpc('list_sports_day_registrations');
    setLoadingRegistrations(false);
    if (error) {
      setMessage('Registrations could not be loaded.');
      return;
    }
    setRegistrations(Array.isArray(data) ? data as Registration[] : []);
  };

  const loadGameResults = async () => {
    if (!supabase) return;
    setLoadingGameResults(true);
    const { data, error } = await supabase
      .from('sports_day_game_results')
      .select('game_name,winner_name,winner_email,winner_team_name,winner_business_unit,runner_up_name,runner_up_email,runner_up_team_name,runner_up_business_unit')
      .order('game_name');
    setLoadingGameResults(false);
    if (error) {
      setMessage('Game results could not be loaded.');
      return;
    }
    setGameResults((data || []) as GameResult[]);
  };

  const loadCaptains = async () => {
    if (!supabase) return;
    setLoadingCaptains(true);
    const { data, error } = await supabase
      .from('sports_day_captains')
      .select('id,team_id,role,name,email,phone,image_url')
      .order('role');
    setLoadingCaptains(false);
    if (error) setMessage('Captain details could not be loaded.');
    else setCaptains((data || []) as CaptainDetail[]);
  };

  useEffect(() => {
    queueMicrotask(() => { void checkAdmin(); });
    const listener = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        void checkAdmin();
      }
    });
    return () => { listener?.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (status === 'authorized') queueMicrotask(() => {
      void loadTeams();
      void loadRegistrations();
      void loadGameResults();
      void loadCaptains();
    });
  }, [status]);

  useEffect(() => {
    if ((pathname === '/admin/login' || pathname.startsWith('/admin/login')) && status === 'authorized') {
      window.location.replace('/admin');
    }
  }, [pathname, status]);

  if (!isSupabaseConfigured) {
    return <main className="admin-shell"><section className="admin-denied"><ShieldAlert/><h1>CONFIGURATION REQUIRED</h1><p>Supabase must be configured before Admin Access can be used.</p></section></main>;
  }

  const login = async () => {
    if (!supabase || oauthLoading) return;
    setOauthLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) {
      setOauthLoading(false);
      setMessage(error.message || 'Google login could not be started.');
    }
  };

  const logout = async () => {
    await supabase?.auth.signOut();
    window.location.assign('/admin/login');
  };

  if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return (
      <main className="admin-login-shell">
        <section className="admin-login-card">
          <div className="admin-login-art"><img src="/images/trophy.svg" alt="" /><span>GADGEON SPORTS DAY</span></div>
          <div className="admin-login-content">
            <span className="admin-kicker">SECURE ADMINISTRATOR PORTAL</span>
            <h1>ADMIN <em>ACCESS</em></h1>
            <p>Manage teams, points, and leaderboard standings.</p>
            {message && <div className="admin-error">{message}</div>}
            <button className="google-button" type="button" onClick={login} disabled={oauthLoading}>
              <GoogleLogo /> {oauthLoading ? 'CONNECTING...' : 'Continue with Google'}
            </button>
            <a className="admin-back" href="/">BACK TO WEBSITE</a>
          </div>
        </section>
      </main>
    );
  }

  if (status === 'loading') return <main className="admin-shell"><section className="admin-loading"><Trophy/><span>VERIFYING ADMIN ACCESS</span></section></main>;
  if (status === 'unauthenticated') return <main className="admin-shell"><section className="admin-denied"><ShieldAlert/><h1>LOGIN REQUIRED</h1><p>Sign in with Google to continue.</p><a href="/admin/login">GO TO ADMIN LOGIN</a></section></main>;
  if (status === 'authorization_error') return <main className="admin-shell"><section className="admin-denied"><ShieldAlert/><h1>AUTHORIZATION ERROR</h1><p>{message}</p><div><strong>Authenticated account</strong><span>{account.email}</span></div><button type="button" onClick={logout}>LOGOUT</button><a href="/">BACK TO WEBSITE</a></section></main>;
  if (status === 'unauthorized') return <main className="admin-shell"><section className="admin-denied"><ShieldAlert/><h1>ACCESS DENIED</h1><p>{message}</p><div><strong>Authenticated account</strong><span>{account.email}</span></div><button type="button" onClick={logout}>LOGOUT</button><a href="/">BACK TO WEBSITE</a></section></main>;

  const ranked = sortTeams(teams);
  const totalPoints = teams.reduce((total, team) => total + team.points, 0);
  const gameNames = [...new Set(registrations.map((registration) => String(registration.event_name || 'Unknown Game')).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const businessUnitSummary = [...registrations.reduce((counts, registration) => {
    const value = String(registration.business_unit || 'Unknown Business Unit');
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const teamSummary = [...registrations.reduce((counts, registration) => {
    const value = String(registration.team_name || 'Unknown Team');
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const gameSummary = [...registrations.reduce((counts, registration) => {
    const value = String(registration.event_name || 'Unknown Game');
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const registrationQuery = registrationSearch.trim().toLowerCase();
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesGame = registrationFilter === 'All Games' || registration.event_name === registrationFilter;
    const matchesSummary = !registrationSummary ||
      (registrationSummary.type === 'business'
        ? String(registration.business_unit || 'Unknown Business Unit') === registrationSummary.value
        : registrationSummary.type === 'team'
          ? String(registration.team_name || 'Unknown Team') === registrationSummary.value
          : String(registration.event_name || 'Unknown Game') === registrationSummary.value);
    const matchesSearch = !registrationQuery || [registration.name, registration.email, registration.mobile_number, registration.team_name, registration.business_unit, registration.event_name]
      .some((value) => String(value || '').toLowerCase().includes(registrationQuery));
    return matchesGame && matchesSummary && matchesSearch;
  });
  const allGames = [...new Set([
    ...registrationConfig.events.flatMap((group) => group.options.map((game) => `${group.group} — ${game}`)),
    ...gameNames,
  ])].sort((a, b) => a.localeCompare(b));

  const openGameResultEditor = (gameName: string, result?: GameResult) => {
    const nextResult = result || {
      game_name: gameName, winner_name: null, winner_email: null, winner_team_name: null, winner_business_unit: null,
      runner_up_name: null, runner_up_email: null, runner_up_team_name: null, runner_up_business_unit: null,
    };
    setEditingGameResult(nextResult);
    setWinnerResultSearch(nextResult.winner_name || '');
    setRunnerUpResultSearch(nextResult.runner_up_name || '');
    setWinnerDropdownOpen(false);
    setRunnerUpDropdownOpen(false);
  };

  const gameParticipants = editingGameResult
    ? [...registrations.reduce((participants, registration) => {
        if (registration.event_name !== editingGameResult.game_name) return participants;
        const key = `${registration.email || ''}|${registration.name || ''}|${registration.team_name || ''}|${registration.business_unit || ''}`;
        if (!participants.has(key)) participants.set(key, registration);
        return participants;
      }, new Map<string, Registration>()).values()]
    : [];

  const selectGameParticipant = (side: 'winner' | 'runner-up', registration: Registration) => {
    if (!editingGameResult) return;
    const name = String(registration.name || '').trim();
    const email = String(registration.email || '').trim();
    const teamName = String(registration.team_name || '').trim();
    const businessUnit = String(registration.business_unit || '').trim();
    if (side === 'winner') {
      setWinnerResultSearch(name);
      setWinnerDropdownOpen(false);
      setEditingGameResult({ ...editingGameResult, winner_name: name || null, winner_email: email || null, winner_team_name: teamName || null, winner_business_unit: businessUnit || null });
    } else {
      setRunnerUpResultSearch(name);
      setRunnerUpDropdownOpen(false);
      setEditingGameResult({ ...editingGameResult, runner_up_name: name || null, runner_up_email: email || null, runner_up_team_name: teamName || null, runner_up_business_unit: businessUnit || null });
    }
  };

  const saveGameResult = async () => {
    if (!editingGameResult || !supabase || savingRef.current) return;
    const winnerEmail = editingGameResult.winner_email?.trim().toLowerCase();
    const runnerUpEmail = editingGameResult.runner_up_email?.trim().toLowerCase();
    if (winnerEmail && runnerUpEmail && winnerEmail === runnerUpEmail) {
      setMessage('Winner and Runners Up must be different participants.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setMessage('');
    const clean = (value: string | null) => value?.trim() || null;
    const payload = {
      game_name: editingGameResult.game_name,
      winner_name: clean(editingGameResult.winner_name), winner_email: clean(editingGameResult.winner_email),
      winner_team_name: clean(editingGameResult.winner_team_name), winner_business_unit: clean(editingGameResult.winner_business_unit),
      runner_up_name: clean(editingGameResult.runner_up_name), runner_up_email: clean(editingGameResult.runner_up_email),
      runner_up_team_name: clean(editingGameResult.runner_up_team_name), runner_up_business_unit: clean(editingGameResult.runner_up_business_unit),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('sports_day_game_results').upsert(payload, { onConflict: 'game_name' });
    setSaving(false);
    savingRef.current = false;
    if (error) { setMessage(error.message || 'Game result could not be saved.'); return; }
    setEditingGameResult(null);
    setToast(`${editingGameResult.game_name} result updated`);
    await loadGameResults();
    window.setTimeout(() => setToast(''), 3500);
  };
  const saveCaptain = async () => {
    if (!editingCaptain || !supabase || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setMessage('');
    const payload = {
      team_id: editingCaptain.team_id,
      role: editingCaptain.role,
      name: editingCaptain.name?.trim() || null,
      email: editingCaptain.email?.trim().toLowerCase() || null,
      phone: editingCaptain.phone?.trim() || null,
      image_url: editingCaptain.image_url?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('sports_day_captains').upsert(payload, { onConflict: 'team_id,role' });
    setSaving(false);
    savingRef.current = false;
    if (error) { setMessage(error.message || 'Captain details could not be saved.'); return; }
    setEditingCaptain(null);
    setToast('Captain details updated');
    await loadCaptains();
    window.setTimeout(() => setToast(''), 3500);
  };

  const savePoints = async () => {
    if (!editing || savingRef.current) return;
    const value = Number(points);
    if (!Number.isInteger(value) || value < 0) { setMessage('Points must be a non-negative whole number.'); return; }
    if (!supabase) return;
    savingRef.current = true;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('sports_day_teams').update({ points: value, updated_at: new Date().toISOString() }).eq('id', editing.id).select('id,name,points').single();
    setSaving(false);
    savingRef.current = false;
    if (error) { setMessage(error.message || 'Points could not be saved.'); return; }
    setEditing(null);
    setToast(`${editing.name} updated to ${value} points`);
    await loadTeams();
    window.setTimeout(() => setToast(''), 3500);
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-nav">
        <a className="admin-brand" href="/"><img src="/gadgeon-icon.png" alt="Gadgeon"/><span><b>GADGEON</b><small>SPORTS DAY 2026</small></span></a>
        <div className="admin-account"><span>{account.email}</span><button type="button" onClick={logout}><LogOut size={16}/> LOGOUT</button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <span className="admin-sidebar-label">ADMIN MENU</span>
          <nav>
            <button type="button" className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
              <LayoutDashboard size={18}/> <span>DASHBOARD</span>
            </button>
            <button type="button" className={activeView === 'registrations' ? 'active' : ''} onClick={() => { setActiveView('registrations'); setRegistrationSummary(null); setRegistrationFilter('All Games'); setRegistrationSearch(''); }}>
              <ClipboardList size={18}/> <span>REGISTRATIONS</span>
            </button>
            <button type="button" className={activeView === 'games' ? 'active' : ''} onClick={() => setActiveView('games')}>
              <Gamepad2 size={18}/> <span>GAMES</span>
            </button>
            <button type="button" className={activeView === 'captains' ? 'active' : ''} onClick={() => setActiveView('captains')}>
              <Trophy size={18}/> <span>CAPTAINS</span>
            </button>
          </nav>
        </aside>
        <div className="admin-dashboard-content">
          {activeView === 'dashboard' ? (
            <>
              <div className="admin-heading"><div><span>GADGEON SPORTS DAY 2026</span><h1>ADMIN DASHBOARD</h1></div><img src="/images/trophy.svg" alt="Trophy"/></div>
              <div className="admin-stats">
                <article><span>Total teams</span><strong>{teams.length || 4}</strong></article>
                <article><span>Total points</span><strong>{totalPoints}</strong></article>
                <article><span>Total registrations</span><strong>{registrations.length}</strong></article>
                <article><span>Signed in as</span><strong>{account.email || 'Google account'}</strong></article>
              </div>
              {message && <div className="admin-error">{message}</div>}
              {toast && <div className="admin-toast"><Check size={16}/>{toast}</div>}
              <section className="admin-team-board">
                <div className="admin-team-head"><span>Rank</span><span>Team</span><span>Points</span><span>Action</span></div>
                {loadingTeams ? <div className="admin-team-loading">Loading teams...</div> : ranked.map((team, index) => (
                  <div className="admin-team-row" key={team.id}>
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <strong>{team.name}</strong>
                    <span>{team.points} Points</span>
                    <button type="button" onClick={() => { setEditing(team); setPoints(String(team.points)); setMessage(''); }}>EDIT POINTS</button>
                  </div>
                ))}
              </section>
            </>
          ) : activeView === 'registrations' ? (
            <>
              <div className="admin-heading"><div><span>GADGEON SPORTS DAY 2026</span><h1>REGISTRATIONS</h1></div><ClipboardList className="admin-heading-icon" size={72}/></div>
              {message && <div className="admin-error">{message}</div>}
              <section className="admin-registration-board">
                <div className="admin-registration-heading">
                  <div><span>PARTICIPANT REGISTRATIONS</span><h2>{registrationSummary ? `${registrationSummary.type === 'business' ? 'BUSINESS UNIT' : registrationSummary.type === 'team' ? 'TEAM' : 'GAME'}: ${registrationSummary.value}` : 'REGISTRATION SUMMARY'}</h2></div>
                  <strong>{registrationSummary ? `${filteredRegistrations.length} registrations` : `${registrations.length} total`}</strong>
                </div>
                {loadingRegistrations ? <div className="admin-team-loading">Loading registrations...</div> : !registrationSummary ? (
                  <div className="admin-registration-summary">
                    <div className="admin-summary-section">
                      <div className="admin-summary-title"><span>BY BUSINESS UNIT</span><strong>{businessUnitSummary.length} units</strong></div>
                      <div className="admin-summary-grid">
                        {businessUnitSummary.map(([name, count]) => (
                          <button type="button" className="admin-summary-card" key={`business-${name}`} onClick={() => { setRegistrationSummary({ type: 'business', value: name }); setRegistrationFilter('All Games'); setRegistrationSearch(''); }}>
                            <span>{name}</span><strong>{count}</strong><small>registrations</small>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-summary-section">
                      <div className="admin-summary-title"><span>BY TEAM</span><strong>{teamSummary.length} teams</strong></div>
                      <div className="admin-summary-grid">
                        {teamSummary.map(([name, count]) => (
                          <button type="button" className="admin-summary-card" key={`team-${name}`} onClick={() => { setRegistrationSummary({ type: 'team', value: name }); setRegistrationFilter('All Games'); setRegistrationSearch(''); }}>
                            <span>{name}</span><strong>{count}</strong><small>registrations</small>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-summary-section admin-summary-game">
                      <div className="admin-summary-title"><span>BY GAME</span><strong>{gameSummary.length} games</strong></div>
                      <div className="admin-summary-grid">
                        {gameSummary.map(([name, count]) => (
                          <button type="button" className="admin-summary-card" key={`game-${name}`} onClick={() => { setRegistrationSummary({ type: 'game', value: name }); setRegistrationFilter(name); setRegistrationSearch(''); }}>
                            <span>{name}</span><strong>{count}</strong><small>registrations</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="admin-registration-controls">
                      <input type="search" value={registrationSearch} onChange={(event) => setRegistrationSearch(event.target.value)} placeholder="Search name, mobile, team, email, or business unit"/>
                      <select value={registrationFilter} onChange={(event) => setRegistrationFilter(event.target.value)} aria-label="Filter registrations by game">
                        <option>All Games</option>
                        {gameNames.map((game) => <option key={game} value={game}>{game}</option>)}
                      </select>
                    </div>
                    <button type="button" className="admin-summary-back" onClick={() => { setRegistrationSummary(null); setRegistrationFilter('All Games'); setRegistrationSearch(''); }}>BACK TO SUMMARY</button>
                    {filteredRegistrations.length === 0 ? (
                      <div className="admin-team-loading">No registrations found.</div>
                    ) : (
                      <>
                        <div className="admin-registration-head"><span>Game</span><span>Participant</span><span>Mobile No</span><span>Team Name</span><span>Business Unit</span><span>Email</span></div>
                        {filteredRegistrations.map((registration, index) => (
                          <div className="admin-registration-row" key={String(registration.id || `${registration.email}-${registration.event_name}-${index}`)}>
                            <strong>{String(registration.event_name || 'Unknown Game')}</strong>
                            <span>{String(registration.name || '-')}</span>
                            <span>{String(registration.mobile_number || '-')}</span>
                            <span>{String(registration.team_name || '-')}</span>
                            <span>{String(registration.business_unit || '-')}</span>
                            <a href={`mailto:${String(registration.email || '')}`}>{String(registration.email || '-')}</a>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </section>
            </>
          ) : activeView === 'captains' ? (
            <>
              <div className="admin-heading"><div><span>GADGEON SPORTS DAY 2026</span><h1>TEAM CAPTAINS</h1></div><Trophy className="admin-heading-icon" size={72}/></div>
              {toast && <div className="admin-toast"><Check size={16}/>{toast}</div>}
              {message && <div className="admin-error">{message}</div>}
              <section className="admin-team-board">
                <div className="admin-team-head"><span>Team</span><span>Captain</span><span>Vice-Captain</span><span>Action</span></div>
                {loadingCaptains ? <div className="admin-team-loading">Loading captain details...</div> : teams.map((team) => {
                  const captain = captains.find((item) => item.team_id === team.id && item.role === 'captain');
                  const vice = captains.find((item) => item.team_id === team.id && item.role === 'vice_captain');
                  return <div className="admin-team-row" key={team.id}><b>TEAM</b><strong>{team.name}</strong><span>{captain?.name || 'Captain not added'}<br/><small>{vice?.name || 'Vice-Captain not added'}</small></span><span><button type="button" onClick={() => setEditingCaptain(captain || { team_id: team.id, role: 'captain', name: null, email: null, phone: null, image_url: null })}>EDIT CAPTAIN</button><button type="button" onClick={() => setEditingCaptain(vice || { team_id: team.id, role: 'vice_captain', name: null, email: null, phone: null, image_url: null })}>EDIT VICE</button></span></div>;
                })}
              </section>
            </>
          ) : (
            <>
              <div className="admin-heading"><div><span>GADGEON SPORTS DAY 2026</span><h1>GAMES</h1></div><Gamepad2 className="admin-heading-icon" size={72}/></div>
              {toast && <div className="admin-toast"><Check size={16}/>{toast}</div>}
              {message && <div className="admin-error">{message}</div>}
              <section className="admin-games-board">
                <div className="admin-games-heading"><div><span>GAME RESULTS</span><h2>WINNER & RUNNERS UP</h2></div><strong>{allGames.length} games</strong></div>
                {loadingGameResults ? <div className="admin-team-loading">Loading game results...</div> : (
                  <div className="admin-games-grid">
                    {allGames.map((gameName) => {
                      const result = gameResults.find((item) => item.game_name === gameName);
                      return (
                        <article className="admin-game-card" key={gameName}>
                          <div className="admin-game-card-head"><div className="admin-game-icon"><Trophy size={20}/></div><div><span>GAME</span><h3>{gameName}</h3></div></div>
                          <div className="admin-game-results">
                            <div className={result?.winner_name ? 'admin-result-row winner has-result' : 'admin-result-row winner'}><Medal size={16}/><div><span>WINNER</span><strong>{result?.winner_name || 'Not assigned'}</strong><small>{result?.winner_email || 'Email not added'} • {result?.winner_team_name || 'Team not added'} • {result?.winner_business_unit || 'BU not added'}</small></div></div>
                            <div className={result?.runner_up_name ? 'admin-result-row runner-up has-result' : 'admin-result-row runner-up'}><Medal size={16}/><div><span>RUNNERS UP</span><strong>{result?.runner_up_name || 'Not assigned'}</strong><small>{result?.runner_up_email || 'Email not added'} • {result?.runner_up_team_name || 'Team not added'} • {result?.runner_up_business_unit || 'BU not added'}</small></div></div>
                          </div>
                          <button type="button" className="admin-game-edit" onClick={() => openGameResultEditor(gameName, result)}>EDIT RESULTS</button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <AnimatePresence>{editingCaptain && (
        <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditingCaptain(null); }}>
          <motion.div className="admin-game-modal" role="dialog" aria-modal="true" aria-labelledby="captain-editor-title" initial={{ y: 20, scale: .97 }} animate={{ y: 0, scale: 1 }}>
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setEditingCaptain(null)} disabled={saving}><X/></button>
            <span className="admin-kicker">{editingCaptain.role === 'captain' ? 'CAPTAIN DETAILS' : 'VICE-CAPTAIN DETAILS'}</span>
            <h2 id="captain-editor-title">{teams.find((team) => team.id === editingCaptain.team_id)?.name || 'Team leader'}</h2>
            <div className="admin-game-result-form">
              <fieldset>
                <legend>Trophy PROFILE</legend>
                <label>Name<input value={editingCaptain.name || ''} onChange={(event) => setEditingCaptain({ ...editingCaptain, name: event.target.value })}/></label>
                <label>Email<input type="email" value={editingCaptain.email || ''} onChange={(event) => setEditingCaptain({ ...editingCaptain, email: event.target.value })}/></label>
                <label>Contact number<input value={editingCaptain.phone || ''} onChange={(event) => setEditingCaptain({ ...editingCaptain, phone: event.target.value })}/></label>
                <label>Profile image URL<input value={editingCaptain.image_url || ''} onChange={(event) => setEditingCaptain({ ...editingCaptain, image_url: event.target.value })} placeholder="/images/profile.jpg or https://..."/></label>
              </fieldset>
            </div>
            <div className="admin-game-modal-actions"><button type="button" className="admin-modal-cancel" onClick={() => setEditingCaptain(null)} disabled={saving}>CANCEL</button><button type="button" className="admin-modal-save" onClick={saveCaptain} disabled={saving}>{saving ? 'SAVING...' : 'SAVE DETAILS'}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{editingGameResult && (
        <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditingGameResult(null); }}>
          <motion.div className="admin-game-modal" role="dialog" aria-modal="true" aria-labelledby="game-result-title" initial={{ y: 20, scale: .97 }} animate={{ y: 0, scale: 1 }}>
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setEditingGameResult(null)} disabled={saving}><X/></button>
            <span className="admin-kicker">GAME RESULT</span>
            <h2 id="game-result-title">{editingGameResult.game_name}</h2>
            <div className="admin-game-result-form">
              <fieldset>
                <legend><Medal size={16}/> WINNER</legend>
                <label>Name<div className="admin-participant-search">
                  <input value={winnerResultSearch} onChange={(event) => { const value = event.target.value; setWinnerResultSearch(value); setWinnerDropdownOpen(true); setEditingGameResult({ ...editingGameResult, winner_name: value || null, winner_email: null, winner_team_name: null, winner_business_unit: null }); }} onFocus={() => setWinnerDropdownOpen(true)} placeholder="Search registered winner" autoComplete="off"/>
                  {winnerDropdownOpen && winnerResultSearch.trim() && <div className="admin-participant-options">
                    {gameParticipants.filter((p) => String(p.email || '').toLowerCase() !== String(editingGameResult.runner_up_email || '').toLowerCase() && [p.name,p.email,p.team_name,p.business_unit].some((v) => String(v || '').toLowerCase().includes(winnerResultSearch.toLowerCase().trim()))).slice(0,8).map((participant) => (
                      <button type="button" key={`${participant.email}-${participant.name}`} onClick={() => selectGameParticipant('winner', participant)}><strong>{participant.name}</strong><span>{participant.email || 'No email'}</span><small>{participant.team_name || 'No team'} • {participant.business_unit || 'No business unit'}</small></button>
                    ))}
                  </div>}
                </div></label>
                <label>Email<input value={editingGameResult.winner_email || ''} readOnly placeholder="Auto-filled from registration"/></label>
                <label>Team Name<input value={editingGameResult.winner_team_name || ''} readOnly placeholder="Auto-filled from registration"/></label>
                <label>Business Unit<input value={editingGameResult.winner_business_unit || ''} readOnly placeholder="Auto-filled from registration"/></label>
              </fieldset>
              <fieldset>
                <legend><Medal size={16}/> RUNNERS UP</legend>
                <label>Name<div className="admin-participant-search">
                  <input value={runnerUpResultSearch} onChange={(event) => { const value = event.target.value; setRunnerUpResultSearch(value); setRunnerUpDropdownOpen(true); setEditingGameResult({ ...editingGameResult, runner_up_name: value || null, runner_up_email: null, runner_up_team_name: null, runner_up_business_unit: null }); }} onFocus={() => setRunnerUpDropdownOpen(true)} placeholder="Search registered runner-up" autoComplete="off"/>
                  {runnerUpDropdownOpen && runnerUpResultSearch.trim() && <div className="admin-participant-options">
                    {gameParticipants.filter((p) => String(p.email || '').toLowerCase() !== String(editingGameResult.winner_email || '').toLowerCase() && [p.name,p.email,p.team_name,p.business_unit].some((v) => String(v || '').toLowerCase().includes(runnerUpResultSearch.toLowerCase().trim()))).slice(0,8).map((participant) => (
                      <button type="button" key={`${participant.email}-${participant.name}`} onClick={() => selectGameParticipant('runner-up', participant)}><strong>{participant.name}</strong><span>{participant.email || 'No email'}</span><small>{participant.team_name || 'No team'} • {participant.business_unit || 'No business unit'}</small></button>
                    ))}
                  </div>}
                </div></label>
                <label>Email<input value={editingGameResult.runner_up_email || ''} readOnly placeholder="Auto-filled from registration"/></label>
                <label>Team Name<input value={editingGameResult.runner_up_team_name || ''} readOnly placeholder="Auto-filled from registration"/></label>
                <label>Business Unit<input value={editingGameResult.runner_up_business_unit || ''} readOnly placeholder="Auto-filled from registration"/></label>
              </fieldset>
            </div>
            {message && <div className="admin-error admin-game-result-error">{message}</div>}
            <div className="admin-modal-actions"><button type="button" className="admin-cancel" onClick={() => setEditingGameResult(null)} disabled={saving}>CANCEL</button><button type="button" className="admin-save" onClick={saveGameResult} disabled={saving}>{saving ? 'SAVING...' : 'SAVE RESULT'}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{editing && (
        <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditing(null); }}>
          <motion.div className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-team-title" initial={{ y: 20, scale: .97 }} animate={{ y: 0, scale: 1 }}>
            <button className="admin-modal-close" type="button" aria-label="Close" onClick={() => setEditing(null)} disabled={saving}><X/></button>
            <span className="admin-kicker">UPDATE TEAM POINTS</span>
            <h2 id="edit-team-title">{editing.name}</h2>
            <label>Current points<input type="number" min="0" step="1" value={points} onChange={(event) => setPoints(event.target.value)} disabled={saving}/></label>
            <div className="admin-modal-actions"><button type="button" className="admin-cancel" onClick={() => setEditing(null)} disabled={saving}>CANCEL</button><button type="button" className="admin-save" onClick={savePoints} disabled={saving}>{saving ? 'SAVING...' : 'SAVE POINTS'}</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </main>
  );
}

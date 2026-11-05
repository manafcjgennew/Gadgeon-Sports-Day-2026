import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert, Trophy, UserRound, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../config/supabase';

type AuthStatus = 'loading' | 'unauthenticated' | 'authorized' | 'unauthorized' | 'authorization_error';
type Captain = { role: 'captain' | 'vice_captain'; name: string | null; email: string | null; phone: string | null; image_url: string | null };
type CaptainTeam = { id: string; name: string; points?: number; captain?: Captain; viceCaptain?: Captain };

const teamColors: Record<string, string> = {
  'Avial Avengers': '#1687ff',
  'Thumbapoo Squad': '#ff7424',
  'Sharkara Upperi Syndicate': '#875cff',
  'Prakmbanam': '#31d0aa',
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

function Profile({ captain, vice, accent }: { captain: Captain; vice?: boolean; accent: string }) {
  const name = captain.name?.trim() || (vice ? 'Vice-Captain' : 'Captain');
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <motion.article className={`captain-profile ${vice ? 'vice-profile' : 'captain-profile-primary'}`} style={{ '--captain-accent': accent } as React.CSSProperties}>
      <div className="captain-role">{vice ? 'VICE-CAPTAIN' : 'CAPTAIN'}</div>
      <div className="captain-image">
        {captain.image_url ? <img src={captain.image_url} alt={name} /> : <span>{initials || <UserRound />}</span>}
      </div>
      <motion.h4 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}>{name}</motion.h4>
      <motion.div className="captain-contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .22 }}>
        {captain.email ? <a href={`mailto:${captain.email}`}>{captain.email}</a> : <span>Email not added</span>}
        {captain.phone ? <a href={`tel:${captain.phone}`}>{captain.phone}</a> : <span>Contact not added</span>}
      </motion.div>
    </motion.article>
  );
}

export default function CaptainsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [message, setMessage] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [teams, setTeams] = useState<CaptainTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [revealStage, setRevealStage] = useState(0);
  const [revealComplete, setRevealComplete] = useState(false);
  const timers = useRef<number[]>([]);

  const clearRevealTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const startReveal = (teamCount = teams.length) => {
    clearRevealTimers();
    if (reducedMotion || teamCount === 0) {
      setRevealStage(teamCount * 3 + 2);
      setRevealComplete(true);
      return;
    }
    setRevealComplete(false);
    setRevealStage(0);
    const stages = teamCount * 3 + 2;
    for (let stage = 1; stage <= stages; stage += 1) {
      timers.current.push(window.setTimeout(() => {
        setRevealStage(stage);
        if (stage === stages) setRevealComplete(true);
      }, stage * 650));
    }
  };

  const loadTeams = async () => {
    if (!supabase) return;
    setLoadingTeams(true);
    setMessage('');
    const { data: teamRows, error: teamError } = await supabase.from('sports_day_teams').select('id,name').order('name');
    if (teamError) {
      setLoadingTeams(false);
      setMessage('Team details could not be loaded. Please try again.');
      return;
    }
    const { data: captainRows, error: captainError } = await supabase.from('sports_day_captains').select('team_id,role,name,email,phone,image_url');
    setLoadingTeams(false);
    if (captainError) {
      setMessage(captainError.code === '42501' ? 'Your account is not authorized to view captain details.' : 'Captain details could not be loaded. Please try again.');
      return;
    }
    const wantedNames = ['Avial Avengers', 'Thumbapoo Squad', 'Sharkara Upperi Syndicate', 'Prakmbanam'];
    const merged = wantedNames.map((name): CaptainTeam | null => {
      const team = teamRows?.find((row) => row.name === name);
      if (!team) return null;
      const rows = (captainRows || []).filter((row) => row.team_id === team.id);
      const captain: Captain | undefined = rows.find((row) => row.role === 'captain');
      const vice: Captain | undefined = rows.find((row) => row.role === 'vice_captain');
      return { id: team.id, name: team.name, captain: captain || { role: 'captain' as const, name: null, email: null, phone: null, image_url: null }, viceCaptain: vice || { role: 'vice_captain' as const, name: null, email: null, phone: null, image_url: null } };
    }).filter((team): team is CaptainTeam => team !== null);
    setTeams(merged);
    startReveal(merged.length);
  };

  const checkAccess = async () => {
    if (!supabase) {
      setStatus('authorization_error');
      setMessage('Supabase is not configured.');
      return;
    }
    setStatus('loading');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setStatus('authorization_error');
      setMessage('Your session could not be verified. Please sign in again.');
      return;
    }
    const session = data.session;
    if (!session?.user) {
      setStatus('unauthenticated');
      setAccountEmail('');
      return;
    }
    setAccountEmail(session.user.email || '');
    const { data: authorized, error: authError } = await supabase.rpc('is_authorized_captains_viewer');
    if (authError) {
      setStatus('authorization_error');
      setMessage('Authorization could not be verified because the secure database check failed.');
    } else if (authorized === true) {
      setStatus('authorized');
    } else {
      setStatus('unauthorized');
      setMessage('Not permitted to view the content');
    }
  };

  useEffect(() => {
    if (!open) {
      clearRevealTimers();
      return;
    }
    void checkAccess();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const listener = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') void checkAccess();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      clearRevealTimers();
      listener?.data.subscription.unsubscribe();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && status === 'authorized') void loadTeams();
  }, [open, status]);

  useEffect(() => () => clearRevealTimers(), []);

  const login = async () => {
    if (!supabase || oauthLoading) return;
    setOauthLoading(true);
    setMessage('');
    const url = new URL(window.location.href);
    url.searchParams.set('captains', '1');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: url.toString(), queryParams: { prompt: 'select_account' } },
    });
    if (error) {
      setOauthLoading(false);
      setMessage(error.message || 'Google sign-in could not be started.');
    }
  };

  const logout = async () => {
    clearRevealTimers();
    await supabase?.auth.signOut();
    setTeams([]);
    setStatus('unauthenticated');
  };

  if (!open) return null;

  return (
    <div className="captains-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div className="captains-modal" role="dialog" aria-modal="true" aria-labelledby="captains-title" initial={{ opacity: 0, scale: .96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }}>
        <div className="captains-light streak-one"/><div className="captains-light streak-two"/>
        <button className="captains-close" type="button" aria-label="Close Meet the Captains" onClick={onClose}><X/></button>
        <div className="captains-modal-inner">
          {status === 'loading' && <div className="captains-state"><Trophy/><span>VERIFYING SECURE ACCESS</span></div>}
          {status === 'unauthenticated' && (
            <div className="captains-login">
              <span className="captains-kicker">GADGEON SPORTS DAY 2026</span>
              <h2 id="captains-title">Meet the Captains</h2>
              <p>Sign in with Gadgeon Google account to view</p>
              {message && <div className="captains-error">{message}</div>}
              {!isSupabaseConfigured && <div className="captains-error">Supabase is not configured.</div>}
              <button className="captains-google" type="button" onClick={login} disabled={oauthLoading}><GoogleLogo/><span>{oauthLoading ? 'CONNECTING...' : 'Continue with Google'}</span></button>
            </div>
          )}
          {(status === 'unauthorized' || status === 'authorization_error') && (
            <div className="captains-state captains-denied"><ShieldAlert/><h2>{status === 'unauthorized' ? 'ACCESS DENIED' : 'AUTHORIZATION ERROR'}</h2><p>{message}</p>{accountEmail && <span>{accountEmail}</span>}<button type="button" onClick={logout}>USE ANOTHER ACCOUNT</button></div>
          )}
          {status === 'authorized' && (
            <>
              <AnimatePresence>
                {revealStage >= 1 && <motion.div className="captains-heading" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }}><span>THE LEADERS OF THE ARENA</span><h2 id="captains-title">MEET YOUR CAPTAINS</h2></motion.div>}
              </AnimatePresence>
              {loadingTeams ? <div className="captains-loading"><span/><span/><span/><span/></div> : (
                <div className="captains-team-grid">
                  {teams.map((team, teamIndex) => {
                    const teamAccent = teamColors[team.name] || '#1687ff';
                    const teamVisible = revealStage >= 2 + teamIndex * 3;
                    const viceVisible = revealStage >= 3 + teamIndex * 3;
                    if (!teamVisible && !revealComplete) return null;
                    return (
                      <motion.section className="captains-team-card" key={team.id} style={{ '--team-accent': teamAccent } as React.CSSProperties} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="captains-team-border"/>
                        <h3>{team.name}</h3>
                        <div className="captains-profiles">
                          {team.captain && <Profile captain={team.captain} accent={teamAccent}/>}
                          {team.viceCaptain && (viceVisible || revealComplete) && <Profile captain={team.viceCaptain} vice accent={teamAccent}/>}
                        </div>
                      </motion.section>
                    );
                  })}
                </div>
              )}
              {!loadingTeams && teams.length === 0 && <div className="captains-state"><Trophy/><p>No captain details are available yet.</p></div>}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

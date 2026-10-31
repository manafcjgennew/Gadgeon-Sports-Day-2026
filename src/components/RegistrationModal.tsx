import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { defaultEventNames, registrationConfig, submitRegistration } from '../config/registration';
import { loadTurnstile, turnstileSiteKey } from '../config/captcha';

type RegistrationModalProps = { open: boolean; onClose: () => void };
type RegistrationForm = { email: string; name: string; businessUnit: string };
type FormErrors = Partial<Record<keyof RegistrationForm | 'eventNames', string>>;
const initialForm: RegistrationForm = { email: '', name: '', businessUnit: '' };

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'duplicate' | 'partial' | 'demo'>('idle');
  const [stage, setStage] = useState<'form' | 'confirmation'>('form');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(defaultEventNames);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [duplicateEvents, setDuplicateEvents] = useState<string[]>([]);
  const [failedEvents, setFailedEvents] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaMessage, setCaptchaMessage] = useState('');
  const widgetId = useRef<string | undefined>(undefined);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || stage !== 'form' || !turnstileSiteKey || !widgetContainer.current) return;
    let cancelled = false;
    loadTurnstile().then(() => {
      if (cancelled || !window.turnstile || !widgetContainer.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey: turnstileSiteKey,
        action: 'sports_registration',
        theme: 'dark',
        appearance: 'always',
        callback: (token) => { setCaptchaToken(token); setCaptchaMessage(''); },
        'expired-callback': () => { setCaptchaToken(''); setCaptchaMessage('CAPTCHA verification expired. Please try again.'); },
        'error-callback': () => { setCaptchaToken(''); setCaptchaMessage('Verification failed. Please try again.'); },
      });
    }).catch(() => setCaptchaMessage('Verification failed. Please try again.'));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [open, stage]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.businessUnit) nextErrors.businessUnit = 'Select a business unit.';
    if (!selectedEvents.length) nextErrors.eventNames = 'Select at least one event.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReview = (event: FormEvent) => {
    event.preventDefault();
    if (status === 'processing') return;
    if (!validate()) return;
    setSubmissionMessage('');
    setCaptchaMessage('');
    setStatus('idle');
    setStage('confirmation');
  };

  const handleConfirm = async () => {
    if (status === 'processing') return;
    if (!captchaToken) {
      setCaptchaMessage('Please complete CAPTCHA verification. Return to the form if verification is unavailable.');
      return;
    }
    setSubmissionMessage('');
    setCaptchaMessage('');
    setStatus('processing');
    const result = await submitRegistration({
      email: form.email.trim(),
      name: form.name.trim().replace(/\s+/g, ' '),
      businessUnit: form.businessUnit,
      eventNames: selectedEvents,
    }, captchaToken);
    if (result.status === 'success') {
      setStatus('success');
      setRegisteredEvents(result.registered || selectedEvents);
      setDuplicateEvents([]);
      setFailedEvents([]);
      setErrors({});
      setCaptchaToken('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    } else {
      setRegisteredEvents(result.registered || []);
      setDuplicateEvents(result.duplicates || []);
      setFailedEvents(result.failed || []);
      setStatus(result.status === 'duplicate' ? 'duplicate' : result.status === 'partial' ? 'partial' : 'error');
      setSubmissionMessage(result.message || 'The registration could not be submitted. Please try again.');
      setCaptchaToken('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }
  };

  const closeModal = () => {
    if (status !== 'processing') {
      onClose();
      window.setTimeout(() => {
        setStatus('idle'); setStage('form'); setErrors({}); setSubmissionMessage(''); setCaptchaMessage(''); setCaptchaToken(''); setForm(initialForm); setSelectedEvents(defaultEventNames); setRegisteredEvents([]); setDuplicateEvents([]); setFailedEvents([]); widgetId.current = undefined;
      }, 250);
    }
  };

  const formIsValid = Boolean(form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.name.trim() && form.businessUnit && selectedEvents.length);
  const toggleEvent = (eventName: string) => {
    setSelectedEvents((current) => current.includes(eventName) ? current.filter((name) => name !== eventName) : [...current, eventName]);
    setErrors((current) => ({ ...current, eventNames: undefined }));
  };
  const getEventValue = (group: string, option: string) => `${group} — ${option}`;
  const parseSelectedEvent = (value: string) => {
    const separator = value.indexOf(' — ');
    return separator >= 0
      ? { category: value.slice(0, separator), name: value.slice(separator + 3) }
      : { category: 'Sports', name: value };
  };

  return (
    <AnimatePresence>{open && (
      <motion.div className="registration-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }} onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <motion.div className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: .98 }} transition={{ duration: reduceMotion ? 0 : .28 }}>
          <button className="registration-close" type="button" aria-label="Close registration form" onClick={closeModal} disabled={status === 'processing'}><X /></button>
          <div className="registration-kicker">REGISTRATION · GADGEON SPORTS DAY</div>
          {stage === 'confirmation' && status === 'idle' ? (
            <>
              <h2 id="registration-title">REVIEW YOUR <em>REGISTRATION</em></h2>
              <p className="registration-subtitle">Almost there! Please review your details and selected events before confirming.</p>
            </>
          ) : (
            <>
              <h2 id="registration-title">GADGEON SPORTS DAY 2026<br /><em>REGISTRATION</em></h2>
              <p className="registration-subtitle">Be part of the excitement. Register now and unleash the champion within!</p>
            </>
          )}
          {status === 'success' ? (
            <div className="registration-result success registration-success"><CheckCircle2 /><div><h3>REGISTRATION SUCCESSFUL!</h3><p>You're officially part of Gadgeon Sports Day 2026. Get ready to unleash the champion within!</p>{duplicateEvents.length > 0 && <p><strong>Existing registrations:</strong> {duplicateEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ')}</p>}<p><strong>Successfully registered events:</strong> {registeredEvents.length ? registeredEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ') : 'None'}</p></div><button type="button" onClick={closeModal}>CLOSE</button></div>
          ) : status === 'demo' ? (
            <div className="registration-result demo"><TriangleAlert /><div><h3>Demo mode</h3><p>Registration submission is ready, but a backend is not connected yet. No information has been sent or saved.</p></div><button type="button" onClick={closeModal}>CLOSE</button></div>
          ) : status === 'partial' ? (
            <div className="registration-result partial"><TriangleAlert /><div><h3>Mixed Registration Result</h3>{registeredEvents.length > 0 && <p><strong>Successfully registered:</strong> {registeredEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ')}</p>}{duplicateEvents.length > 0 && <p><strong>Already registered:</strong> {duplicateEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ')}</p>}{failedEvents.length > 0 && <p><strong>Not submitted:</strong> {failedEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ')}</p>}</div><button type="button" onClick={() => { setStatus('idle'); setStage('form'); }}>BACK TO EDIT</button></div>
          ) : status === 'duplicate' ? (
            <div className="registration-result duplicate"><TriangleAlert /><div><h3>Already Registered!</h3><p><strong>Already registered:</strong> {duplicateEvents.length ? duplicateEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(', ') : submissionMessage}</p><p>No duplicate registration was created. You can change the selected events or return with the same details.</p></div><button type="button" onClick={() => { setStatus('idle'); setStage('form'); }}>BACK TO EDIT</button></div>
          ) : status === 'error' ? (
            <div className="registration-result error"><TriangleAlert /><div><h3>Registration not submitted</h3><p>{submissionMessage}</p></div><button type="button" onClick={() => setStatus('idle')}>TRY AGAIN</button></div>
          ) : stage === 'confirmation' ? (
            <div className="registration-confirmation">
              <div className="registration-review-details">
                <div><span>Name</span><strong>{form.name}</strong></div>
                <div><span>Email</span><strong>{form.email.trim()}</strong></div>
                <div><span>Business Unit</span><strong>{form.businessUnit}</strong></div>
              </div>
              <div className="registration-events-heading"><span>YOUR SELECTED EVENTS</span><strong>{selectedEvents.length} selected</strong></div>
              <div className="registration-review-events">
                {registrationConfig.events.map((group) => {
                  const events = selectedEvents.map(parseSelectedEvent).filter((item) => item.category === group.group);
                  return events.length > 0 ? (
                    <section className="registration-review-category" key={group.group}>
                      <h3>{group.group}</h3>
                      <div className="registration-review-cards">
                        {events.map((item) => (
                          <div className="registration-review-card" key={`${item.category}-${item.name}`}>
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null;
                })}
              </div>
              {captchaMessage && <span className="field-error captcha-error">{captchaMessage}</span>}
              <div className="registration-confirmation-actions">
                <button className="registration-back-button" type="button" onClick={() => { setStatus('idle'); setStage('form'); }} disabled={status === 'processing'}>BACK TO EDIT</button>
                <button className="registration-submit" type="button" onClick={handleConfirm} disabled={status === 'processing' || !captchaToken}>
                  {status === 'processing' ? <><LoaderCircle className="spin" /> SUBMITTING...</> : 'CONFIRM & REGISTER'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReview} noValidate>
              <div className="registration-field"><label htmlFor="registration-email">Email</label><input id="registration-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@gadgeon.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} /><span id="email-error" className="field-error">{errors.email}</span></div>
              <div className="registration-field"><label htmlFor="registration-name">Name</label><input id="registration-name" type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} /><span id="name-error" className="field-error">{errors.name}</span></div>
              <div className="registration-field"><label htmlFor="registration-business">Business Unit</label><select id="registration-business" value={form.businessUnit} onChange={(event) => setForm({ ...form, businessUnit: event.target.value })} aria-invalid={Boolean(errors.businessUnit)} aria-describedby={errors.businessUnit ? 'business-error' : undefined}><option value="">Select a business unit</option>{registrationConfig.businessUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select><span id="business-error" className="field-error">{errors.businessUnit}</span></div>
              <div className="registration-events">
                <div className="registration-events-heading">
                  <span>Select Events</span>
                  <strong>{selectedEvents.length} selected</strong>
                </div>
                <div className="registration-event-groups">
                  {registrationConfig.events.map((group) => (
                    <fieldset key={group.group}>
                      <legend>{group.group}</legend>
                      <div className="registration-event-options">
                        {group.options.map((option) => {
                          const value = getEventValue(group.group, option);
                          return (
                            <label className="registration-event-option" key={`${group.group}-${option}`}>
                              <input type="checkbox" checked={selectedEvents.includes(value)} onChange={() => toggleEvent(value)} />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
                <span id="event-error" className="field-error">{errors.eventNames}</span>
                <div className="registration-event-summary" aria-live="polite">
                  <strong>Selected events</strong>
                  {selectedEvents.length ? <span>{selectedEvents.map((value) => { const item = parseSelectedEvent(value); return `${item.name} – ${item.category}`; }).join(' · ')}</span> : <span>No events selected</span>}
                </div>
              </div>
              <div className="registration-captcha">
                <div ref={widgetContainer} id="turnstile-container"></div>
                {!turnstileSiteKey && <span className="field-error">Turnstile is not configured. Add VITE_TURNSTILE_SITE_KEY.</span>}
                {captchaMessage && <span className="field-error captcha-error">{captchaMessage}</span>}
                <button className="registration-submit" type="submit" disabled={status === 'processing' || !formIsValid}>{status === 'processing' ? <><LoaderCircle className="spin" /> REVIEWING...</> : 'REVIEW REGISTRATION'}</button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}

export default RegistrationModal;

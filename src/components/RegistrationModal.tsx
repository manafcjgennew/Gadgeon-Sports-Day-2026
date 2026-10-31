import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { registrationConfig, submitRegistration, type RegistrationPayload } from '../config/registration';
import { loadTurnstile, turnstileSiteKey } from '../config/captcha';

type RegistrationModalProps = { open: boolean; onClose: () => void };
type FormErrors = Partial<Record<keyof RegistrationPayload, string>>;
const initialForm: RegistrationPayload = { email: '', name: '', businessUnit: '', eventName: '' };

export function RegistrationModal({ open, onClose }: RegistrationModalProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'demo'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaMessage, setCaptchaMessage] = useState('');
  const widgetId = useRef<string | undefined>(undefined);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !turnstileSiteKey || !widgetContainer.current) return;
    let cancelled = false;
    loadTurnstile().then(() => {
      if (cancelled || !window.turnstile || !widgetContainer.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey: turnstileSiteKey,
        theme: 'dark',
        appearance: 'always',
        callback: (token) => { setCaptchaToken(token); setCaptchaMessage(''); },
        'expired-callback': () => { setCaptchaToken(''); setCaptchaMessage('CAPTCHA verification expired. Please try again.'); },
        'error-callback': () => { setCaptchaToken(''); setCaptchaMessage('Verification failed. Please try again.'); },
      });
    }).catch(() => setCaptchaMessage('Verification failed. Please try again.'));
    return () => { cancelled = true; };
  }, [open]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.businessUnit) nextErrors.businessUnit = 'Select a business unit.';
    if (!form.eventName) nextErrors.eventName = 'Select an event.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'processing') return;
    if (!validate()) return;
    if (!captchaToken) {
      setCaptchaMessage('Please complete CAPTCHA verification.');
      return;
    }
    setSubmissionMessage('');
    setCaptchaMessage('');
    setStatus('processing');
    const result = await submitRegistration({
      email: form.email.trim(),
      name: form.name.trim().replace(/\s+/g, ' '),
      businessUnit: form.businessUnit,
      eventName: form.eventName,
    }, captchaToken);
    if (result.status === 'success') {
      setStatus('success');
      setForm(initialForm);
      setErrors({});
      setCaptchaToken('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    } else {
      setStatus('error');
      setSubmissionMessage(result.message || 'The registration could not be submitted. Please try again.');
      setCaptchaToken('');
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    }
  };

  const closeModal = () => {
    if (status !== 'processing') {
      onClose();
      window.setTimeout(() => {
        setStatus('idle'); setErrors({}); setSubmissionMessage(''); setCaptchaMessage(''); setCaptchaToken(''); setForm(initialForm); widgetId.current = undefined;
      }, 250);
    }
  };

  const formIsValid = Boolean(form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.name.trim() && form.businessUnit && form.eventName);

  return (
    <AnimatePresence>{open && (
      <motion.div className="registration-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }} onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
        <motion.div className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title" initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: .98 }} transition={{ duration: reduceMotion ? 0 : .28 }}>
          <button className="registration-close" type="button" aria-label="Close registration form" onClick={closeModal} disabled={status === 'processing'}><X /></button>
          <div className="registration-kicker">REGISTRATION · GADGEON SPORTS DAY</div>
          <h2 id="registration-title">GADGEON SPORTS DAY 2026<br /><em>REGISTRATION</em></h2>
          <p className="registration-subtitle">Be part of the excitement. Register now and unleash the champion within!</p>
          {status === 'success' ? (
            <div className="registration-result success"><CheckCircle2 /><div><h3>Registration Successful!</h3><p>Thank you for registering for Gadgeon Sports Day 2026. Get ready to unleash the champion within!</p></div><button type="button" onClick={closeModal}>CLOSE</button></div>
          ) : status === 'demo' ? (
            <div className="registration-result demo"><TriangleAlert /><div><h3>Demo mode</h3><p>Registration submission is ready, but a backend is not connected yet. No information has been sent or saved.</p></div><button type="button" onClick={closeModal}>CLOSE</button></div>
          ) : status === 'error' ? (
            <div className="registration-result error"><TriangleAlert /><div><h3>Registration not submitted</h3><p>{submissionMessage}</p></div><button type="button" onClick={() => setStatus('idle')}>TRY AGAIN</button></div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="registration-field"><label htmlFor="registration-email">Email</label><input id="registration-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@gadgeon.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} /><span id="email-error" className="field-error">{errors.email}</span></div>
              <div className="registration-field"><label htmlFor="registration-name">Name</label><input id="registration-name" type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} /><span id="name-error" className="field-error">{errors.name}</span></div>
              <div className="registration-field"><label htmlFor="registration-business">Business Unit</label><select id="registration-business" value={form.businessUnit} onChange={(event) => setForm({ ...form, businessUnit: event.target.value })} aria-invalid={Boolean(errors.businessUnit)} aria-describedby={errors.businessUnit ? 'business-error' : undefined}><option value="">Select a business unit</option>{registrationConfig.businessUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select><span id="business-error" className="field-error">{errors.businessUnit}</span></div>
              <div className="registration-field"><label htmlFor="registration-event">Event Name</label><select id="registration-event" value={form.eventName} onChange={(event) => setForm({ ...form, eventName: event.target.value })} aria-invalid={Boolean(errors.eventName)} aria-describedby={errors.eventName ? 'event-error' : undefined}><option value="">Select an event</option>{registrationConfig.events.map((group) => <optgroup key={group.group} label={group.group}>{group.options.map((option) => <option key={`${group.group}-${option}`} value={`${group.group} — ${option}`}>{option}</option>)}</optgroup>)}</select><span id="event-error" className="field-error">{errors.eventName}</span></div>
              <div className="registration-captcha">
                <div ref={widgetContainer} id="turnstile-container"></div>
                {!turnstileSiteKey && <span className="field-error">Turnstile is not configured. Add VITE_TURNSTILE_SITE_KEY.</span>}
                {captchaMessage && <span className="field-error captcha-error">{captchaMessage}</span>}
                <button className="registration-submit" type="submit" disabled={status === 'processing' || !formIsValid || !captchaToken}>{status === 'processing' ? <><LoaderCircle className="spin" /> SUBMITTING...</> : 'REGISTER NOW'}</button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}

export default RegistrationModal;

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !inStandalone && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PWAInstallButton({ variant = 'menu' }: { variant?: 'menu' | 'footer' }) {
  const reducedMotion = useReducedMotion();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showGuide, setShowGuide] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const iosSafari = isIosSafari();

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowGuide(false);
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 4000);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (iosSafari) {
      setShowGuide(true);
      return;
    }
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 4000);
    }
    setPromptEvent(null);
  };

  if (installed || (!iosSafari && !promptEvent)) return null;

  return (
    <>
      <button type="button" className={`pwa-install-button pwa-install-${variant}`} onClick={install}>
        <Download size={variant === 'footer' ? 14 : 16}/>
        <span>Install App</span>
      </button>
      <AnimatePresence>
        {showGuide && (
          <motion.div className="pwa-guide-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuide(false); }}>
            <motion.div className="pwa-guide-modal" role="dialog" aria-modal="true" aria-labelledby="pwa-guide-title" initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: .98 }}>
              <button type="button" className="pwa-guide-close" aria-label="Close install guide" onClick={() => setShowGuide(false)}><X size={18}/></button>
              <img src="/gadgeon-sports-day-192.png" alt="" className="pwa-guide-icon"/>
              <span className="pwa-guide-kicker">INSTALL THE APP</span>
              <h2 id="pwa-guide-title">Add Sports Day to your Home Screen</h2>
              <div className="pwa-guide-steps">
                <div><b>1</b><span><Share size={19}/> Tap the <strong>Share</strong> button in Safari.</span></div>
                <div><b>2</b><span>Select <strong>Add to Home Screen</strong>.</span></div>
                <div><b>3</b><span>Tap <strong>Add</strong>.</span></div>
              </div>
              <button type="button" className="pwa-guide-done" onClick={() => setShowGuide(false)}>Got it</button>
            </motion.div>
          </motion.div>
        )}
        {showSuccess && (
          <motion.div className="pwa-success-toast" role="status" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><CheckCircle2 size={18}/><span>Sports Day installed successfully!</span></motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

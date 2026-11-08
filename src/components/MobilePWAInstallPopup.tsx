import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSAL_KEY = 'sports-day-pwa-popup-dismissed-at';
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000;

function isMobileDevice() {
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  const ua = navigator.userAgent;
  const iosOrAndroid = /Android|iPhone|iPad|iPod/i.test(ua);
  const mobileTouch = navigator.maxTouchPoints > 1 && /Mobile|Tablet/i.test(ua);
  return iosOrAndroid || mobileTouch;
}

function isIosBrowser() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios;
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function wasRecentlyDismissed() {
  const dismissedAt = Number(localStorage.getItem(DISMISSAL_KEY) || 0);
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISSAL_DURATION;
}

export default function MobilePWAInstallPopup({ suppressed = false }: { suppressed?: boolean }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [androidStatus, setAndroidStatus] = useState('');
  const mobile = isMobileDevice();
  const iosBrowser = isIosBrowser();

  useEffect(() => {
    if (!mobile || isInstalled() || wasRecentlyDismissed() || suppressed) return;
    const oauthActive = Boolean(
      new URLSearchParams(window.location.search).get('captains') ||
      window.location.search.includes('code=') ||
      window.location.hash.includes('access_token=')
    );
    if (oauthActive) return;
    const timer = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(timer);
  }, [mobile, suppressed]);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setVisible(false);
      localStorage.removeItem(DISMISSAL_KEY);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (suppressed && visible) setVisible(false);
  }, [suppressed, visible]);

  const closePopup = () => {
    localStorage.setItem(DISMISSAL_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!promptEvent) {
      setAndroidStatus('Use your browser menu and select "Add to Home screen" or "Install app".');
      return;
    }
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  if (!mobile || isInstalled()) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="mobile-pwa-overlay" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="mobile-pwa-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-pwa-title"
            initial={reducedMotion ? false : { opacity: 0, scale: .94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .96, y: 12 }}
            transition={{ duration: .32, ease: 'easeOut' }}
          >
            <button type="button" className="mobile-pwa-close" aria-label="Close Add to Home Screen popup" onClick={closePopup}><X size={18}/></button>
            <img src="/gadgeon-sports-day-192.png" alt="Gadgeon Sports Day" className="mobile-pwa-icon"/>
            <span className="mobile-pwa-kicker">SPORTS DAY 2026</span>
            <h2 id="mobile-pwa-title">Add Gadgeon Sports Day 2026 to your Home Screen</h2>
            {iosBrowser ? (
              <>
                <p>Tap the Share button, then 'Add to Home Screen'</p>
                <div className="mobile-pwa-share-hint"><Share size={20}/><span>Share menu</span></div>
              </>
            ) : (
              <>
                <button type="button" className="mobile-pwa-add-button" onClick={install}>Add to Home Screen</button>
                {androidStatus && <p className="mobile-pwa-status">{androidStatus}</p>}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';

export function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load'));
    document.head.appendChild(script);
  });
}

export interface TurnstileWidget {
  render(container: string | HTMLElement, options: { sitekey: string; theme?: 'light' | 'dark' | 'auto'; appearance?: 'always' | 'execute' | 'interaction-only'; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }): string;
  reset(widgetId?: string): void;
}

declare global {
  interface Window { turnstile?: TurnstileWidget }
}

import { registerSW } from 'virtual:pwa-register';

let deferredPrompt: Event | null = null;

export function initPWA(): void {
  registerSW({
    onOfflineReady() {
      console.log('App ready for offline use');
    },
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const event = deferredPrompt as any;
  event.prompt();
  const result = await event.userChoice;
  deferredPrompt = null;
  return result.outcome === 'accepted';
}

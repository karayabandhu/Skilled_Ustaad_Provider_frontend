import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const PWAInstallButton = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("Installation Tip", {
        description: "To install: Open your browser's menu (three dots or share icon) and select 'Add to Home Screen'.",
        duration: 8000
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // Only hide the button if the app is confirmed as installed
  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center w-full px-4 py-3 mt-auto mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase transition-all bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-blue-900/30 group gap-2 shadow-sm"
    >
      <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
      {t('sidebar.install')}
    </button>
  );
};

export default PWAInstallButton;

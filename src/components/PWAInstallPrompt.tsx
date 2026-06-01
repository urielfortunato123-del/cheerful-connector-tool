import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone || 
                     document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if we've already shown it this session to avoid being annoying
      const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        // Show the prompt after a short delay for better UX
        setTimeout(() => setIsVisible(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('Aplicativo instalado com sucesso!');
      setIsVisible(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          <div className="glass-card p-5 border-primary/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 orange-glow">
                {isMobile ? <Smartphone className="text-primary" /> : <Monitor className="text-primary" />}
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                  Instalar InfraFlow
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Acesse o sistema diretamente da sua tela inicial com suporte offline e melhor performance.
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleInstall}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest h-9"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Instalar Agora
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-9 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5"
                  >
                    Agora não
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

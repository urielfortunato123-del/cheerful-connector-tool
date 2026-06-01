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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone || 
                     document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Detect mobile and iOS
    const ua = navigator.userAgent;
    const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    
    setIsMobile(mobile);
    setIsIOS(ios);

    // Show prompt for iOS immediately (since it doesn't support beforeinstallprompt)
    if (ios && !isStandalone) {
      const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setIsVisible(true);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        // Show immediately when event is received
        setIsVisible(true);
      }
    };

    const triggerHandler = () => {
      if (deferredPrompt || ios) {
        setIsVisible(true);
      } else {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone;
        if (isStandalone) {
          toast.info("O aplicativo já está instalado.");
        } else {
          setIsVisible(true); // Show instructions even if prompt isn't supported
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('trigger-pwa-install', triggerHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', triggerHandler);
    };
  }, [deferredPrompt]);

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
      {isVisible && (
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
                {isIOS ? <Smartphone className="text-primary" /> : (isMobile ? <Smartphone className="text-primary" /> : <Monitor className="text-primary" />)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                  Instalar InfraFlow
                </h3>
                
                {isIOS ? (
                  <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                    <p className="mb-2">Para instalar no seu iPhone/iPad:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta)</li>
                      <li>Role para baixo e toque em <strong>Tela de Início</strong></li>
                      <li>Toque em <strong>Adicionar</strong> no canto superior</li>
                    </ol>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {deferredPrompt 
                      ? "Acesse o sistema diretamente da sua tela inicial com suporte offline e melhor performance."
                      : "Para instalar, use a opção 'Instalar' ou 'Adicionar à tela de início' no menu do seu navegador."}
                  </p>
                )}
                
                <div className="flex gap-2">
                  {deferredPrompt && (
                    <Button 
                      onClick={handleInstall}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest h-9"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Instalar Agora
                    </Button>
                  )}
                  <Button 
                    variant={deferredPrompt ? "ghost" : "default"}
                    onClick={handleDismiss}
                    className={cn(
                      "h-9 text-[10px] uppercase tracking-widest font-bold",
                      !deferredPrompt && "flex-1 bg-primary hover:bg-primary/90 text-white"
                    )}
                  >
                    {deferredPrompt ? "Agora não" : "Entendido"}
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

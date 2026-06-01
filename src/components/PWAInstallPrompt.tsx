import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Monitor, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

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

  const logEvent = async (eventType: 'displayed' | 'accepted' | 'dismissed' | 'failed') => {
    try {
      const ua = navigator.userAgent;
      const platform = /iPad|iPhone|iPod/.test(ua) ? 'ios' : (/Android/.test(ua) ? 'android' : 'desktop');
      
      await supabase.from('pwa_events').insert({
        event_type: eventType,
        platform,
        user_agent: ua
      });
    } catch (error) {
      console.error('Error logging PWA event:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone || 
                     (document.referrer && document.referrer.includes('android-app://'));

    if (isStandalone) return;

    // Detect mobile and iOS
    const ua = navigator.userAgent;
    const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    
    setIsMobile(mobile);
    setIsIOS(ios);

    // Show prompt for iOS immediately
    if (ios && !isStandalone) {
      // We show it automatically as requested, but maybe with a slight delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        logEvent('displayed');
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Automatically show the custom prompt when the browser says it's ready
      // We removed the session check to ensure it always appears as requested
      setIsVisible(true);
      logEvent('displayed');
    };

    const triggerHandler = () => {
      setIsVisible(true);
      logEvent('displayed');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('trigger-pwa-install', triggerHandler);

    // Fallback: If after 5 seconds the prompt haven't appeared and it's not iOS/Standalone,
    // we could show it anyway to guide the user (optional, but requested "automatic")
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !ios && !isStandalone) {
        setIsVisible(true);
        logEvent('displayed');
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', triggerHandler);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Aplicativo instalado com sucesso!');
        setIsVisible(false);
        logEvent('accepted');
      } else {
        logEvent('dismissed');
      }
    } catch (error) {
      console.error('PWA Installation failed:', error);
      logEvent('failed');
      toast.error('Falha ao iniciar a instalação.');
    } finally {
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    logEvent('dismissed');
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

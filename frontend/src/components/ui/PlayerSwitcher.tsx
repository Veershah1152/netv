import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerInfo } from '@/types/player.types';
import { FiShield, FiShieldOff, FiX, FiInfo, FiSmartphone } from 'react-icons/fi';

interface PlayerSwitcherProps {
  players: PlayerInfo[];
  activePlayerId: string;
  onSelectPlayer: (id: string) => void;
  sandboxActive: boolean;
  onToggleSandbox: (active: boolean) => void;
}

const getIcon = (id: string): string => {
  if (id === 'trailer') return '🎬';
  return '▶️';
};

export const PlayerSwitcher: React.FC<PlayerSwitcherProps> = ({
  players,
  activePlayerId,
  onSelectPlayer,
  sandboxActive,
  onToggleSandbox,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 bg-nv-surface/40 rounded-card border border-nv-border/40 backdrop-blur-sm">
      {/* Left: Player Selection */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-text-muted text-small font-semibold uppercase tracking-wider mr-1 select-none">
          Select Player:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {players.map((player) => {
            const isActive = player.id === activePlayerId;
            const isDisabled = player.id === 'trailer' && !player.url;

            return (
              <motion.button
                key={player.id}
                onClick={() => !isDisabled && onSelectPlayer(player.id)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-btn text-small font-bold transition-all duration-150 border relative overflow-hidden flex items-center gap-1.5 ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed bg-nv-elevated border-nv-border text-text-muted'
                    : isActive
                    ? 'bg-brand-red border-brand-red text-white shadow-md shadow-brand-red/20'
                    : 'bg-nv-elevated border-nv-border text-text-secondary hover:text-white hover:border-white/30'
                }`}
                whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                whileTap={!isDisabled ? { scale: 0.97 } : undefined}
              >
                <span>{getIcon(player.id)}</span>
                <span>{player.name}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-2 border-white rounded-btn opacity-30 pointer-events-none"
                    layoutId="activePlayerOutline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right: Ad Shield Toggle & Mobile Guide */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Ad Shield Toggle */}
        <button
          onClick={() => onToggleSandbox(!sandboxActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-small font-bold border transition-all duration-150 ${
            sandboxActive
              ? 'bg-green-600/20 border-green-600 text-green-400'
              : 'bg-nv-elevated border-nv-border text-text-muted hover:text-text-secondary hover:border-white/20'
          }`}
          title={sandboxActive ? 'Disable popup blocker' : 'Enable experimental popup blocker'}
        >
          {sandboxActive ? <FiShield className="w-4 h-4" /> : <FiShieldOff className="w-4 h-4" />}
          <span>Ad-Shield: {sandboxActive ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mobile Guide Button */}
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-small font-bold bg-nv-elevated border border-nv-border text-text-secondary hover:text-white hover:border-white/20 transition-all duration-150"
          title="How to stream ad-free on mobile"
        >
          <FiSmartphone className="w-4 h-4 text-brand-red animate-pulse" />
          <span>Mobile Ad-Free Guide</span>
        </button>
      </div>

      {/* Mobile Ad-blocking Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
            />

            {/* Modal Body */}
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-nv-surface border border-nv-border p-6 rounded-card shadow-modal z-[51] text-white"
              initial={{ opacity: 0, scale: 0.95, y: '-40%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, y: '-40%' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between border-b border-nv-border pb-3 mb-4">
                <h3 className="text-h3 font-bold flex items-center gap-2">
                  <FiSmartphone className="w-6 h-6 text-brand-red" />
                  Mobile Ad-Free Guide
                </h3>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-body text-text-secondary overflow-y-auto max-h-[70vh] pr-1">
                <p className="text-small text-text-muted leading-relaxed">
                  Free stream servers serve aggressive redirect and popup ads to pay for hosting. Because mobile browsers don't easily support desktop extensions, here are the most effective ways to block all popups and stream cleanly on your phone:
                </p>

                {/* Android Section */}
                <div className="p-3 bg-nv-elevated/40 border border-nv-border/30 rounded-card">
                  <span className="font-bold text-white text-ui flex items-center gap-1.5 mb-1.5">
                    🤖 Android Devices
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-small leading-relaxed">
                    <li>
                      <strong className="text-white">Brave Browser (Recommended)</strong>: Download Brave from the Play Store. It blocks all iframe popups and redirects automatically out-of-the-box.
                    </li>
                    <li>
                      <strong className="text-white">Firefox with uBlock Origin</strong>: Install Firefox mobile, open the Add-ons menu inside the browser settings, and install the <span className="text-brand-red">uBlock Origin</span> extension.
                    </li>
                  </ul>
                </div>

                {/* iOS Section */}
                <div className="p-3 bg-nv-elevated/40 border border-nv-border/30 rounded-card">
                  <span className="font-bold text-white text-ui flex items-center gap-1.5 mb-1.5">
                    🍎 Apple iOS (iPhone/iPad)
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-small leading-relaxed">
                    <li>
                      <strong className="text-white">Brave Browser</strong>: Available on the App Store. Blocks all media page redirects natively.
                    </li>
                    <li>
                      <strong className="text-white">Safari Content Blockers</strong>: Install <span className="text-brand-red">AdGuard</span> or <span className="text-brand-red">1Blocker</span> from the App Store. Go to iPhone Settings &gt; Safari &gt; Extensions, and enable them to filter Safari popups.
                    </li>
                  </ul>
                </div>

                {/* Experimental Ad Shield Info */}
                <div className="p-3 bg-green-950/20 border border-green-600/30 rounded-card flex gap-2">
                  <FiInfo className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-small text-green-300 leading-relaxed">
                    <strong>Experimental Ad-Shield Toggle</strong>: You can toggle the <span className="font-bold">Ad-Shield ON</span> above. This applies a sandbox container. Some video servers might display a <em>"Sandbox Detected"</em> error page. If this happens, switch servers or toggle the shield off.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="bg-brand-red hover:bg-brand-red-dark text-white px-5 py-2 rounded-btn font-semibold text-ui transition-colors duration-150"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface KioskBannerProps {
  countdown: number;
  isKiosk: boolean;
  language: 'fr' | 'en';
}

export const KioskBanner: React.FC<KioskBannerProps> = ({ countdown, isKiosk, language }) => {
  if (!isKiosk) return null;

  return (
    <div className="bg-amber-500 text-slate-900 text-xs px-4 py-1.5 flex items-center justify-between font-medium shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-xs bg-red-600 animate-ping" />
        <span>
          {language === 'en'
            ? 'Kiosk Mode Active – Campus Terminal'
            : 'Mode Borne Kiosque Actif – Stand ENSPD'}
        </span>
      </div>
      <div className="flex items-center gap-1 font-mono font-bold">
        <Clock size={13} />
        <span>
          {language === 'en' ? `Reset in ${countdown}s` : `Retour accueil dans ${countdown}s`}
        </span>
      </div>
    </div>
  );
};


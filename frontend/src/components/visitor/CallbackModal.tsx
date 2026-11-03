import React, { useState } from 'react';
import { PhoneCall, X, CheckCircle, Shield, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'en';
  profile: string;
}

export const CallbackModal: React.FC<CallbackModalProps> = ({
  isOpen,
  onClose,
  language,
  profile
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('admission');
  const [preferredTime, setPreferredTime] = useState('apres-midi');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError(isEn ? "Please accept the contact agreement." : "Veuillez cocher la case d'accord de contact.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await api.createCallback({
        full_name: fullName,
        phone_number: phone,
        profile,
        topic,
        preferred_time_slot: preferredTime,
        comment: message,
        parental_consent_given: consent
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || (isEn ? "Submission failed. Please try again." : "Erreur lors de l'envoi. Veuillez réessayer."));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setFullName('');
    setPhone('');
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* 06. Demande de rappel - Modal Card matching Mockup 06 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative text-left">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Left Side Photo Column (Matching Mockup 06) */}
          <div className="md:col-span-2 relative hidden md:block overflow-hidden">
            <img
              src="/images/campus-courtyard.webp"
              alt="Campus ENSPD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-poly-deepNavy/90 via-poly-navy/40 to-transparent flex items-end p-5 text-white">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-poly-gold uppercase tracking-wider">
                  Accompagnement ENSPD
                </span>
                <p className="text-xs font-semibold leading-snug">
                  {isEn
                    ? "Our pedagogical advisors are here to answer all your admission questions."
                    : "Nos conseillers pédagogiques répondent à toutes vos questions d'admission."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Column (Matching Mockup 06) */}
          <div className="md:col-span-3 p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-xl font-black text-poly-navy dark:text-white">
                {isEn ? "Leave us your contact info" : "Laissez-nous vos coordonnées"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isEn
                  ? "We will contact you to answer all your questions."
                  : "Nous vous recontacterons pour répondre à vos questions."}
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle size={24} />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {isEn ? "Request registered!" : "Demande enregistrée !"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {isEn
                    ? "An academic advisor will call you shortly on the provided phone number."
                    : "Un conseiller pédagogique ou référent d'orientation vous appellera prochainement."}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="bg-poly-navy text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs"
                  >
                    {isEn ? "Close" : "Fermer"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? "Full Name" : "Nom complet"} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isEn ? "e.g. Jean Dupont" : "Ex: Paul Kamga"}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy dark:focus:ring-poly-gold"
                    />
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? "Phone Number" : "Numéro de téléphone"} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 699 00 00 00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy dark:focus:ring-poly-gold"
                  />
                </div>

                {/* Message optionnel */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? "Your message (optional)" : "Votre message (optionnel)"}
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isEn ? "Track inquiry, admission details..." : "Filière souhaitée, question sur le concours..."}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-poly-navy dark:focus:ring-poly-gold"
                  />
                </div>

                {/* Checkbox consentement RGPD (Mockup 06) */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-poly-gold focus:ring-poly-gold"
                  />
                  <label htmlFor="consent" className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug cursor-pointer select-none">
                    {isEn
                      ? "I agree to be contacted by ENSPD representatives regarding admissions."
                      : "J'accepte d'être contacté(e) par l'ENSPD concernant les admissions."}
                  </label>
                </div>

                {/* Bouton d'envoi Gold (Mockup 06) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-poly-gold hover:bg-poly-goldHover text-slate-950 font-extrabold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (isEn ? "Sending..." : "Envoi en cours...") : (isEn ? "Send my request" : "Envoyer ma demande")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

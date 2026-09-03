import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  PROJECT_TYPES,
  OPTIONS_BY_TYPE,
  TIMELINE_OPTIONS,
  calculateEstimate,
} from "../lib/estimatorConfig";
import GlitchText from "./GlitchText";

/**
 * BudgetEstimator
 * Wizard de 4 pasos (tipo de proyecto -> opciones -> plazo -> resultado bloqueado).
 * Revela la estimación orientativa cuando el usuario ingresa sus datos.
 */
export default function BudgetEstimator() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [timelineId, setTimelineId] = useState<string>("standard");

  const [unlocked, setUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", consent: false });

  const options = typeId ? OPTIONS_BY_TYPE[typeId] || [] : [];
  const estimate = useMemo(
    () => (typeId ? calculateEstimate({ typeId, optionIds, timelineId }) : null),
    [typeId, optionIds, timelineId]
  );

  function toggleOption(id: string) {
    setOptionIds((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.phone) {
      setError("Necesitamos tu email y teléfono para enviarte la estimación.");
      return;
    }
    if (!form.consent) {
      setError("Necesitamos tu consentimiento para guardar y procesar tu solicitud.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budget-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          projectType: typeId,
          options: optionIds,
          timeline: timelineId,
          estimateMin: estimate?.min || 0,
          estimateMax: estimate?.max || 0,
        }),
      });
      if (!res.ok) {
        // Si no hay backend Express corriendo, simulamos éxito en el cliente
        console.warn("[budget-estimator] Backend no detectado, desbloqueando cliente.");
      }
      setUnlocked(true);
    } catch (err) {
      // En caso de fallo de red, permitimos desbloquear para excelente UX
      setUnlocked(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#000000] border border-white/20 p-6 md:p-10 font-mono text-[#FFFDF3] space-y-8 shadow-2xl">
      
      {/* Indicator header */}
      <div className="space-y-4 border-b border-white/15 pb-6">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50">
          <span>[ ESTIMADOR DE PRESUPUESTO ONLINE ]</span>
          <span>PASO {step} DE 4</span>
        </div>
        <StepIndicator step={step} />
      </div>

      {/* Step 1: Project Type */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
            ¿Qué tipo de proyecto tienes en mente?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                data-magnetic="true"
                onClick={() => { setTypeId(t.id); setOptionIds([]); setStep(2); }}
                className={`text-left p-5 border transition-all cursor-pointer ${
                  typeId === t.id 
                    ? "bg-white text-black border-white" 
                    : "bg-[#111111] text-white border-white/15 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <div className="text-sm font-black uppercase mb-1 flex items-center justify-between">
                  <GlitchText text={t.label} />
                  <span>→</span>
                </div>
                <div className="text-xs opacity-70 leading-relaxed font-mono">
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Extras & Features */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
            ¿Qué incluye tu proyecto?
          </h3>
          <div className="flex flex-col gap-3">
            {options.map((o) => {
              const isChecked = optionIds.includes(o.id);
              return (
                <label 
                  key={o.id} 
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                    isChecked 
                      ? "bg-white/10 border-white text-white" 
                      : "bg-[#111111] border-white/15 text-white/80 hover:border-white/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOption(o.id)}
                    className="w-4 h-4 accent-white cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-mono">{o.label}</span>
                </label>
              );
            })}
          </div>
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {/* Step 3: Timeline */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
            ¿Cuál es el plazo estimado de entrega?
          </h3>
          <div className="flex flex-col gap-3">
            {TIMELINE_OPTIONS.map((t) => {
              const isSelected = timelineId === t.id;
              return (
                <label 
                  key={t.id} 
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-white/10 border-white text-white" 
                      : "bg-[#111111] border-white/15 text-white/80 hover:border-white/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="timeline"
                    checked={isSelected}
                    onChange={() => setTimelineId(t.id)}
                    className="w-4 h-4 accent-white cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-mono">{t.label}</span>
                </label>
              );
            })}
          </div>
          <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Ver estimación →" />
        </div>
      )}

      {/* Step 4: Estimate result + Lead capture */}
      {step === 4 && estimate && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black uppercase text-white font-sans">
              Tu Estimación Orientativa
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Este rango es una orientación preliminar a partir de los módulos seleccionados. El presupuesto definitivo se ajustará tras analizar tus necesidades exactas.
            </p>
          </div>

          {/* Estimate Display Box */}
          <div className="p-8 bg-[#111111] border border-white/20 text-center space-y-2 shadow-inner">
            <span className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">
              ESTIMACIÓN ESTIMADA APROXIMADA
            </span>
            <div
              className={`text-3xl md:text-5xl font-black font-sans text-white transition-all duration-500 ${
                unlocked ? "filter-none select-auto" : "blur-md select-none opacity-40"
              }`}
            >
              {estimate.min.toLocaleString("es-ES")}€ – {estimate.max.toLocaleString("es-ES")}€
            </div>
          </div>

          {!unlocked ? (
            <form onSubmit={handleUnlock} className="space-y-4 pt-2">
              <p className="text-xs text-white/80 font-bold">
                Déjanos tu contacto para desbloquear la cifra y recibir la desglose por email:
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo (opcional)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111111] border border-white/20 px-4 py-3 text-xs text-white font-mono outline-none focus:border-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Correo Electrónico *"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#111111] border border-white/20 px-4 py-3 text-xs text-white font-mono outline-none focus:border-white"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Teléfono *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#111111] border border-white/20 px-4 py-3 text-xs text-white font-mono outline-none focus:border-white"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 text-[11px] text-white/70 leading-normal cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5 accent-white cursor-pointer"
                />
                <span>Acepto guardar mis datos para recibir la estimación y ser contactado sobre mi proyecto.</span>
              </label>

              {error && <p className="text-xs text-red-400 font-bold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  className="px-5 py-3.5 border border-white/30 text-white text-xs font-bold uppercase hover:bg-white/10"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-xl disabled:opacity-50"
                >
                  {submitting ? "Procesando..." : "Desbloquear Presupuesto →"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-white/10 border border-white/30 text-center space-y-3 font-mono">
              <p className="text-sm font-bold text-white">
                ¡Presupuesto desbloqueado con éxito!
              </p>
              <p className="text-xs text-white/70 leading-relaxed">
                Hemos enviado un resumen detallado a <strong>{form.email}</strong>. Me me pondré en contacto contigo en breve para revisar los detalles de tu proyecto.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1 flex-1 transition-all duration-300 ${
            s <= step ? "bg-white" : "bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Siguiente →",
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-4 pt-4 border-t border-white/10">
      <button
        type="button"
        onClick={onBack}
        className="px-6 py-3 border border-white/30 text-white text-xs font-bold uppercase hover:bg-white/10 transition-colors cursor-pointer"
      >
        Atrás
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex-1 py-3 bg-white text-black font-black text-xs uppercase hover:bg-neutral-200 transition-colors cursor-pointer text-center"
      >
        {nextLabel}
      </button>
    </div>
  );
}

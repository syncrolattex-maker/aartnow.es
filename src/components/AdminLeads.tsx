import { useEffect, useState } from "react";

export interface BudgetLead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  estimateMin: number;
  estimateMax: number;
}

/**
 * AdminLeads
 * Panel simple para consultar los leads recibidos del estimador de presupuesto.
 * Guarda la contraseña de administración en sessionStorage y la envía como Bearer token.
 */
export default function AdminLeads() {
  const [password, setPassword] = useState<string>(() => sessionStorage.getItem("admin_pw") || "");
  const [leads, setLeads] = useState<BudgetLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchLeads(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/budget-leads", {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 401) {
        setError("Contraseña incorrecta.");
        setLeads(null);
        sessionStorage.removeItem("admin_pw");
        return;
      }
      if (!res.ok) throw new Error("request_failed");
      const data = await res.json();
      setLeads(data.leads || []);
      sessionStorage.setItem("admin_pw", pw);
    } catch (e) {
      // Si no hay backend Express corriendo, mostramos panel de demostración si la clave introducida es "admin"
      if (pw === "admin" || pw === "aartnow2026") {
        setLeads([
          {
            id: "lead-1",
            createdAt: new Date().toISOString(),
            name: "Ejemplo Estudio",
            email: "contacto@estudioejemplo.com",
            phone: "+34 600 000 000",
            projectType: "web",
            estimateMin: 2200,
            estimateMax: 2900,
          }
        ]);
        sessionStorage.setItem("admin_pw", pw);
      } else {
        setError("No se ha podido conectar con el servidor o contraseña incorrecta.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) fetchLeads(password);
  }, []);

  if (!leads) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#FFFDF3] font-mono flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#111111] border border-white/20 p-8 space-y-6 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-bold">[ ACCESO RESTRINGIDO ]</span>
            <h3 className="text-xl font-black uppercase text-white font-sans">Panel de Leads</h3>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); fetchLeads(password); }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Contraseña Administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#000000] border border-white/20 p-3 text-xs text-white outline-none focus:border-white font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3.5 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Comprobando..." : "Acceder al Panel →"}
            </button>
            {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFDF3] font-mono p-6 md:p-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/15 pb-6 gap-4">
        <div>
          <span className="text-xs text-white/50 uppercase tracking-widest font-bold">[ ADMIN DASHBOARD ]</span>
          <h2 className="text-2xl md:text-4xl font-black uppercase text-white font-sans">
            Consultas de Presupuesto ({leads.length})
          </h2>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_pw"); setLeads(null); setPassword(""); }}
          className="px-4 py-2 border border-white/20 text-xs font-bold uppercase hover:bg-white/10"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="overflow-x-auto border border-white/15 bg-[#111111]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/20 bg-white/5 text-white/70 uppercase">
              <th className="p-4">Fecha</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Estimación Mostrada</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/40 font-bold">
                  No hay consultas registradas aún.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white/60">{new Date(lead.createdAt).toLocaleString("es-ES")}</td>
                  <td className="p-4 font-bold text-white">{lead.name || "—"}</td>
                  <td className="p-4 text-white">{lead.email}</td>
                  <td className="p-4 text-white/80">{lead.phone}</td>
                  <td className="p-4 uppercase font-bold text-white/90">{lead.projectType}</td>
                  <td className="p-4 font-bold text-white">
                    {lead.estimateMin.toLocaleString("es-ES")}€ – {lead.estimateMax.toLocaleString("es-ES")}€
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

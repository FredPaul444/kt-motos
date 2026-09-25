"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase" // si tu supabase esta en otra ruta cambialo

export default function LoginPage() {
  const [cedula, setCedula] = useState("")
  const [clave, setClave] = useState("")
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setCargando(true)

    try {
      // Busca el usuario en Supabase
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("cedula", cedula)
        .eq("clave", clave)
        .single()

      if (error || !data) {
        alert("Cédula o clave incorrecta")
        setCargando(false)
        return
      }

      // FIX DE SEGURIDAD: Usamos sessionStorage, no localStorage
      // sessionStorage se borra al cerrar la pestaña
      sessionStorage.setItem("user", JSON.stringify(data))
      localStorage.removeItem("user") // limpia el viejo por si acaso

      // Manda al dashboard
      window.location.href = "/dashboard"

    } catch (err) {
      alert("Error al conectar")
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
        <h1 className="text-3xl font-black text-orange-500 text-center mb-2">KT MOTOS</h1>
        <p className="text-zinc-500 text-center text-sm mb-8">Sistema de Gestión</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-zinc-400 text-sm">Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="1723456789"
              className="w-full mt-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm">Clave</label>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-3 rounded-lg mt-6 transition"
          >
            {cargando ? "Entrando..." : "INGRESAR"}
          </button>
        </form>

        <div className="mt-6 text-xs text-zinc-600 text-center">
          <p>Super: 1723456789 / admin123</p>
        </div>
      </div>
    </div>
  )
}
"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modulo, setModulo] = useState("inicio")
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.addEventListener("pageshow", (event: any) => {
      if (event.persisted) {
        sessionStorage.clear()
        window.location.href = "/"
      }
    })

    const u = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null")
    if (!u) {
      window.location.href = "/"
      return
    }
    setUser(u)
    if (localStorage.getItem("user")) {
      sessionStorage.setItem("user", localStorage.getItem("user")!)
      localStorage.removeItem("user")
    }
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase.from("usuarios").select("*").order("rol")
    if (data) setUsuarios(data)
    setLoading(false)
  }

  const handleSalir = () => {
    sessionStorage.clear()
    localStorage.clear()
    window.location.href = "/"
  }

  if (!user) return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>

  const MenuItem = ({ id, icon, label }: any) => (
    <button
      onClick={() => setModulo(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition font-bold ${modulo === id ? "bg-orange-500 text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
    >
      <span>{icon}</span> {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="text-xl font-black text-orange-500 mb-1">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">SUPER ADMIN • {user.nombre}</p>

        <div className="space-y-2 flex-1">
          <MenuItem id="inicio" icon="🏠" label="Inicio" />
          <MenuItem id="inventario" icon="🏍️" label="Inventario / Motos" />
          <MenuItem id="usuarios" icon="👥" label="Usuarios" />
          <MenuItem id="ventas" icon="💰" label="Ventas" />
          <MenuItem id="compras" icon="🛒" label="Compras" />
          <MenuItem id="reportes" icon="📊" label="Reportes" />
        </div>

        <button onClick={handleSalir} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-black mt-4">
          Salir
        </button>
        <p className="text-[10px] text-zinc-600 mt-3 text-center">✅ Sesión segura - se cierra al cerrar pestaña</p>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-8 overflow-y-auto">
        {modulo === "inicio" && (
          <div>
            <h2 className="text-4xl font-black mb-2">Hola, <span className="text-orange-500">{user.nombre}</span> 👋</h2>
            <p className="text-zinc-500 mb-8">Panel de control super admin</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-zinc-500 text-sm">Total Usuarios</p><p className="text-3xl font-black text-orange-500 mt-2">{usuarios.length}</p></div>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-zinc-500 text-sm">Ventas Hoy</p><p className="text-3xl font-black text-green-500 mt-2">$0</p></div>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-zinc-500 text-sm">Stock Motos</p><p className="text-3xl font-black text-white mt-2">--</p></div>
            </div>
          </div>
        )}

        {modulo === "usuarios" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Gestión de Usuarios</h2>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800 text-zinc-400"><tr><th className="p-3 text-left">Cédula</th><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Rol</th><th className="p-3 text-left">Clave</th></tr></thead>
                <tbody>
                  {usuarios.map((u: any) => (
                    <tr key={u.cedula} className="border-t border-zinc-800"><td className="p-3">{u.cedula}</td><td className="p-3">{u.nombre}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.rol === 'super_usuario' ? 'bg-orange-500 text-black' : u.rol === 'usuario' ? 'bg-blue-600' : 'bg-zinc-700'}`}>{u.rol}</span></td><td className="p-3 text-zinc-500">{u.clave}</td></tr>
                  ))}
                </tbody>
              </table>
              {loading && <p className="p-4 text-zinc-500">Cargando usuarios...</p>}
            </div>
          </div>
        )}

        {modulo === "inventario" && (
          <div><h2 className="text-3xl font-black mb-6">Inventario / Motos</h2><div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-500">Aquí vamos a conectar tu tabla de motos/inventario. ¿Cómo se llama tu tabla en Supabase? ¿motos o productos?</div></div>
        )}
        {modulo === "ventas" && (
          <div><h2 className="text-3xl font-black mb-6">Ventas</h2><div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-500">Módulo de ventas listo para conectar.</div></div>
        )}
        {modulo === "compras" && (
          <div><h2 className="text-3xl font-black mb-6">Compras</h2><div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-500">Módulo de compras - ya tienes la tabla COMPRAS en Supabase, la conectamos aquí.</div></div>
        )}
        {modulo === "reportes" && (
          <div><h2 className="text-3xl font-black mb-6">Reportes</h2><div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-500">Reportes de ventas, usuarios y stock.</div></div>
        )}
      </div>
    </div>
  )
}
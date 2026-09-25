"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modulo, setModulo] = useState("usuarios")
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form nuevo usuario
  const [cedula, setCedula] = useState("")
  const [nombre, setNombre] = useState("")
  const [clave, setClave] = useState("")
  const [rol, setRol] = useState("usuario")

  useEffect(() => {
    window.addEventListener("pageshow", (event: any) => {
      if (event.persisted) { sessionStorage.clear(); window.location.href = "/" }
    })
    const u = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u)
    if (localStorage.getItem("user")) {
      sessionStorage.setItem("user", localStorage.getItem("user")!)
      localStorage.removeItem("user")
    }
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase.from("usuarios").select("*").order("cedula")
    if (data) setUsuarios(data)
    setLoading(false)
  }

  const crearUsuario = async (e: any) => {
    e.preventDefault()
    if(!cedula || !nombre || !clave) return alert("Llena todo bro")
    
    const { error } = await supabase.from("usuarios").insert([{ cedula, nombre, clave, rol }])
    if (error) {
      if(error.code === '23505') alert("Esa cédula ya existe")
      else alert("Error: " + error.message)
    } else {
      alert("Usuario creado ✅")
      setCedula(""); setNombre(""); setClave(""); setRol("usuario")
      cargarUsuarios()
    }
  }

  const borrarUsuario = async (ced: string) => {
    if(ced === user.cedula) return alert("No te puedes borrar a ti mismo bro 😅")
    if(!confirm(`¿Seguro que quieres borrar a ${ced}?`)) return

    const { error } = await supabase.from("usuarios").delete().eq("cedula", ced)
    if(error) alert("Error al borrar: " + error.message)
    else {
      setUsuarios(usuarios.filter(u => u.cedula !== ced))
    }
  }

  const handleSalir = () => { sessionStorage.clear(); localStorage.clear(); window.location.href = "/" }
  if (!user) return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>

  const MenuItem = ({ id, icon, label }: any) => (
    <button onClick={() => setModulo(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold ${modulo === id ? "bg-orange-500 text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
      <span>{icon}</span> {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="text-xl font-black text-orange-500">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre}</p>
        <div className="space-y-2 flex-1">
          <MenuItem id="inicio" icon="🏠" label="Inicio" />
          <MenuItem id="inventario" icon="🏍️" label="Inventario" />
          <MenuItem id="usuarios" icon="👥" label="Usuarios" />
          <MenuItem id="ventas" icon="💰" label="Ventas" />
          <MenuItem id="compras" icon="🛒" label="Compras" />
          <MenuItem id="reportes" icon="📊" label="Reportes" />
        </div>
        <button onClick={handleSalir} className="w-full bg-red-600 py-3 rounded-xl font-black mt-4">Salir</button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {modulo === "usuarios" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Gestión de Usuarios</h2>
            
            {/* FORM CREAR */}
            <form onSubmit={crearUsuario} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-4 gap-4">
              <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="Cédula" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-orange-500" required />
              <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-orange-500" required />
              <input value={clave} onChange={e=>setClave(e.target.value)} placeholder="Clave" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-orange-500" required />
              <select value={rol} onChange={e=>setRol(e.target.value)} className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 outline-none">
                <option value="usuario">Usuario (empleado)</option>
                <option value="cliente">Cliente</option>
                <option value="super_usuario">Super Usuario</option>
              </select>
              <button type="submit" className="col-span-4 bg-orange-500 text-black font-black py-3 rounded-lg hover:bg-orange-400">+ AGREGAR USUARIO</button>
            </form>

            {/* TABLA */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800 text-zinc-400"><tr><th className="p-3 text-left">Cédula</th><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Rol</th><th className="p-3 text-left">Acción</th></tr></thead>
                <tbody>
                  {usuarios.map((u: any) => (
                    <tr key={u.cedula} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-3">{u.cedula}</td>
                      <td className="p-3">{u.nombre}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.rol === 'super_usuario' ? 'bg-orange-500 text-black' : u.rol === 'usuario' ? 'bg-blue-600' : 'bg-zinc-700'}`}>{u.rol}</span></td>
                      <td className="p-3"><button onClick={()=>borrarUsuario(u.cedula)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold text-xs">Borrar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <p className="p-4 text-zinc-500">Cargando...</p>}
            </div>
          </div>
        )}
        {modulo !== "usuarios" && <div className="text-zinc-500">Módulo {modulo} - lo dejamos para después</div>}
      </div>
    </div>
  )
}
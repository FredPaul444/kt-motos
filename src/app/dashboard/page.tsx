"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage(){
  const [user,setUser] = useState<any>(null)
  const [compras,setCompras] = useState<any[]>([])

  useEffect(()=>{
    const u = localStorage.getItem("user")
    if(!u){ window.location.href="/"; return }
    const parsed = JSON.parse(u)
    setUser(parsed)
    
    // TRAER COMPRAS DE ESTE CLIENTE
    supabase.from("compras").select("*").eq("cedula_cliente", parsed.cedula).order("created_at",{ascending:false}).then(({data})=>{
      if(data) setCompras(data)
    })
  },[])

  if(!user) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-orange-500">KT MOTOS</h1>
        <button onClick={()=>{localStorage.clear(); location.href="/"}} className="bg-red-600 px-4 py-2 rounded text-sm">Salir</button>
      </div>

      <div className="p-8">
        <h2 className="text-4xl font-bold">Hola, <span className="text-orange-500">{user.nombre || user.nombres}</span> 👋</h2>
        <p className="text-zinc-400 mt-2">Bienvenido a tu portal de cliente</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-zinc-900 p-6 rounded-xl"><p className="text-zinc-400 text-sm">Cédula</p><p className="text-xl font-bold">{user.cedula}</p></div>
          <div className="bg-zinc-900 p-6 rounded-xl"><p className="text-zinc-400 text-sm">Compras</p><p className="text-xl font-bold">{compras.length} registradas</p></div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-orange-500/30"><p className="text-zinc-400 text-sm">Beneficios</p><p className="text-xl font-bold">0 Activos</p></div>
        </div>

        {/* TABLA DE COMPRAS */}
        <div className="bg-zinc-900 p-6 rounded-xl mt-8">
          <h3 className="font-bold text-lg mb-4">Mis Compras 🛒</h3>
          {compras.length===0 ? (
            <p className="text-zinc-500">Aún no tienes compras registradas</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-zinc-500"><tr><th className="text-left p-2">Fecha</th><th className="text-left">Producto</th><th className="text-left">Monto</th><th className="text-left">Descripción</th></tr></thead>
              <tbody>
                {compras.map((c:any)=>(
                  <tr key={c.id} className="border-t border-zinc-800">
                    <td className="p-2">{c.fecha}</td>
                    <td className="font-bold text-orange-400">{c.producto}</td>
                    <td className="text-green-400 font-bold">${c.monto}</td>
                    <td className="text-zinc-400">{c.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
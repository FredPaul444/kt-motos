"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [hojas, setHojas] = useState<any[]>([])
  const [misHojas, setMisHojas] = useState<any[]>([])
  const [modulo, setModulo] = useState("clientes")
  const [puntosInput, setPuntosInput] = useState<{[key:string]: string}>({})
  const [formCliente, setFormCliente] = useState({cedula:"", nombre:"", telefono:"", direccion:"", clave:""})
  const [formHoja, setFormHoja] = useState({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" })
  const [sugerencias, setSugerencias] = useState<any[]>([])

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u); cargarClientes(); cargarHojas()
  }, [])

  const cargarClientes = async () => { const {data} = await supabase.from("clientes").select("*").order("nombre"); if(data) setClientes(data) }
  const cargarHojas = async () => {
    const {data} = await supabase.from("hojas_trabajo").select("*").order("created_at",{ascending:false})
    if(data) {
      setHojas(data)
      const u = JSON.parse(sessionStorage.getItem("user") || "null")
      if(u?.rol === "cliente") setMisHojas(data.filter((h:any)=> h.cedula_cliente === u.cedula))
    }
  }

  const crearCliente = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("clientes").insert([{...formCliente, puntos:0}])
    if(error) alert(error.message); else { alert("Cliente registrado ✅"); setFormCliente({cedula:"", nombre:"", telefono:"", direccion:"", clave:""}); cargarClientes() }
  }

  // SUMAR
  const sumarPuntos = async (cliente:any) => {
    const cantidad = Math.abs(Number(puntosInput[cliente.id] || 0))
    if(cantidad === 0) return alert("Pon cuantos puntos quieres sumar")
    const nuevos = (cliente.puntos || 0) + cantidad
    await supabase.from("clientes").update({puntos: nuevos}).eq("id", cliente.id)
    setPuntosInput({...puntosInput, [cliente.id]:""}); cargarClientes()
  }
  // RESTAR
  const restarPuntos = async (cliente:any) => {
    const cantidad = Math.abs(Number(puntosInput[cliente.id] || 0))
    if(cantidad === 0) return alert("Pon cuantos puntos quieres restar")
    let nuevos = (cliente.puntos || 0) - cantidad
    if(nuevos < 0) nuevos = 0
    await supabase.from("clientes").update({puntos: nuevos}).eq("id", cliente.id)
    setPuntosInput({...puntosInput, [cliente.id]:""}); cargarClientes()
  }
  // BORRAR TODO A 0
  const borrarPuntos = async (cliente:any) => {
    if(!confirm(`¿Poner en 0 los puntos de ${cliente.nombre}?`)) return
    await supabase.from("clientes").update({puntos: 0}).eq("id", cliente.id)
    cargarClientes()
  }

  const crearHoja = async (e:any) => {
    e.preventDefault()
    await supabase.from("hojas_trabajo").insert([{...formHoja, mano_obra: Number(formHoja.mano_obra||0), costo_repuestos: Number(formHoja.costo_repuestos||0), creado_por: user.cedula}])
    alert("Hoja creada ✅"); cargarHojas()
  }

  const buscarClientePorNombre = (texto:string) => {
    setFormHoja({...formHoja, nombre_cliente: texto})
    if(texto.length < 2) { setSugerencias([]); return }
    setSugerencias(clientes.filter(c => c.nombre.toLowerCase().includes(texto.toLowerCase())).slice(0,5))
  }

  if(!user) return <div className="p-10 bg-black text-white">Cargando...</div>

  if(user.rol === "cliente") {
    const clienteActual = clientes.find(c=> c.cedula === user.cedula)
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 mb-6 text-center">
            <h2 className="text-3xl font-black">Hola {user.nombre} 👋</h2>
            <div className="mt-4 bg-black rounded-2xl p-4 border border-orange-500/30">
              <p className="text-zinc-500 text-xs font-bold">TUS PUNTOS KT</p>
              <p className="text-5xl font-black text-orange-500">{clienteActual?.puntos ?? user.puntos ?? 0}</p>
            </div>
            <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-4 bg-red-600 w-full py-2 rounded-xl font-bold">Salir</button>
          </div>
          {misHojas.map(h=><div key={h.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-2"><p className="font-bold">{h.modelo_moto} - {h.placa} - {h.estado}</p></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 mt-6 ${modulo==="hojas"?"bg-orange-500 text-black":"bg-zinc-800"}`}>📋 Hojas</button>
        <button onClick={()=>setModulo("clientes")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="clientes"?"bg-orange-500 text-black":"bg-zinc-800"}`}>👥 Clientes + Puntos</button>
        <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {modulo==="clientes" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Clientes - Control de Puntos</h2>
            <form onSubmit={crearCliente} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-5 gap-3">
              <input value={formCliente.cedula} onChange={e=>setFormCliente({...formCliente,cedula:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Dirección" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.clave} onChange={e=>setFormCliente({...formCliente,clave:e.target.value})} placeholder="Clave" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <button className="col-span-5 bg-orange-500 text-black font-black py-3 rounded-xl">+ REGISTRAR</button>
            </form>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-zinc-800 text-zinc-400"><tr><th className="p-3 text-left">Cliente</th><th className="p-3 text-center">Puntos</th><th className="p-3 text-center">Control</th></tr></thead>
              <tbody>{clientes.map(c=>(
                <tr key={c.id} className="border-t border-zinc-800">
                  <td className="p-3"><b>{c.nombre}</b><br/><span className="text-xs text-zinc-500">{c.cedula}</span></td>
                  <td className="p-3 text-center"><span className="bg-orange-500 text-black font-black px-4 py-1 rounded-full text-lg">{c.puntos || 0}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center items-center">
                      <input type="number" value={puntosInput[c.id] || ""} onChange={e=>setPuntosInput({...puntosInput, [c.id]: e.target.value})} placeholder="10" className="w-20 p-2 rounded bg-zinc-800 border border-zinc-700 text-center font-bold" />
                      <button onClick={()=>sumarPuntos(c)} className="bg-green-600 px-3 py-2 rounded-lg font-black text-xs">+ SUMAR</button>
                      <button onClick={()=>restarPuntos(c)} className="bg-yellow-600 px-3 py-2 rounded-lg font-black text-xs text-black">- RESTAR</button>
                      <button onClick={()=>borrarPuntos(c)} className="bg-red-600 px-2 py-2 rounded-lg font-bold text-xs">BORRAR</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        )}
        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Nueva Hoja</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 grid grid-cols-3 gap-3 relative">
              <div className="col-span-3 relative">
                <input value={formHoja.nombre_cliente} onChange={e=>buscarClientePorNombre(e.target.value)} placeholder="Escribe nombre cliente" className="w-full p-3 rounded bg-zinc-800 border border-orange-500/50" required />
                {sugerencias.length>0 && <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-xl mt-1">{sugerencias.map(s=><button type="button" key={s.id} onClick={()=>{setFormHoja({...formHoja, cedula_cliente:s.cedula, nombre_cliente:s.nombre, telefono:s.telefono}); setSugerencias([])}} className="w-full text-left p-3 hover:bg-orange-500 hover:text-black text-sm"><b>{s.nombre}</b> ({s.puntos} pts)</button>)}</div>}
              </div>
              <input value={formHoja.cedula_cliente} onChange={e=>setFormHoja({...formHoja,cedula_cliente:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.telefono} onChange={e=>setFormHoja({...formHoja,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.modelo_moto} onChange={e=>setFormHoja({...formHoja,modelo_moto:e.target.value})} placeholder="Modelo Moto" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <button className="col-span-3 bg-orange-500 text-black font-black py-3 rounded-xl">+ CREAR HOJA</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
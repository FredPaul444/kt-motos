"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modulo, setModulo] = useState("hojas")
  const [clientes, setClientes] = useState<any[]>([])
  const [hojas, setHojas] = useState<any[]>([])
  const [misHojas, setMisHojas] = useState<any[]>([])
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
      // Si es cliente, filtrar solo las suyas
      const u = JSON.parse(sessionStorage.getItem("user") || "null")
      if(u?.rol === "cliente") {
        setMisHojas(data.filter((h:any)=> h.cedula_cliente === u.cedula))
      }
    }
  }

  const crearCliente = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("clientes").insert([formCliente])
    if(error) alert(error.message); else { alert("Cliente registrado ✅ Clave: "+formCliente.clave); setFormCliente({cedula:"", nombre:"", telefono:"", direccion:"", clave:""}); cargarClientes() }
  }

  const crearHoja = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("hojas_trabajo").insert([{...formHoja, mano_obra: Number(formHoja.mano_obra||0), costo_repuestos: Number(formHoja.costo_repuestos||0), creado_por: user.cedula}])
    if(error) alert(error.message); else { alert("Hoja creada ✅"); cargarHojas() }
  }

  const buscarClientePorNombre = (texto:string) => {
    setFormHoja({...formHoja, nombre_cliente: texto})
    if(texto.length < 2) { setSugerencias([]); return }
    const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(texto.toLowerCase()))
    setSugerencias(filtrados.slice(0,5))
  }

  if(!user) return <div className="p-10 bg-black text-white">Cargando...</div>

  // VISTA CLIENTE
  if(user.rol === "cliente") {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6">
            <h1 className="text-orange-500 font-black text-xl">KT MOTOS</h1>
            <h2 className="text-3xl font-black mt-2">Hola, {user.nombre} 👋</h2>
            <p className="text-zinc-500">Cédula: {user.cedula} | Tel: {user.telefono}</p>
            <p className="text-zinc-500">Dirección: {user.direccion}</p>
            <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-4 bg-red-600 px-4 py-2 rounded-xl font-bold">Salir</button>
          </div>

          <h3 className="text-xl font-black mb-4">Mis Trabajos ({misHojas.length})</h3>
          <div className="grid gap-3">
            {misHojas.map(h=>(
              <div key={h.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <p className="font-black">{h.modelo_moto} - {h.placa} <span className={`ml-2 text-xs px-2 py-1 rounded font-bold ${h.estado==='pendiente'?'bg-yellow-600':h.estado==='en_proceso'?'bg-blue-600':h.estado==='terminado'?'bg-green-600':'bg-zinc-600'}`}>{h.estado.toUpperCase()}</span></p>
                <p className="text-sm mt-1">Problema: {h.problema}</p>
                <p className="text-sm text-orange-400">Trabajo: {h.trabajo_realizar}</p>
                <p className="text-sm mt-2 font-bold">Total a pagar: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p>
                <p className="text-xs text-zinc-500 mt-1">Fecha: {new Date(h.created_at).toLocaleString()}</p>
              </div>
            ))}
            {misHojas.length === 0 && <p className="text-zinc-500 text-center py-10">Aún no tienes trabajos registrados</p>}
          </div>
        </div>
      </div>
    )
  }

  // VISTA ADMIN (igual que antes)
  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre} - SUPER</p>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="hojas"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>📋 Hojas</button>
        <button onClick={()=>setModulo("clientes")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="clientes"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>👥 Clientes</button>
        <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {modulo==="clientes" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Registrar Clientes (con clave para que entren)</h2>
            <form onSubmit={crearCliente} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-5 gap-3">
              <input value={formCliente.cedula} onChange={e=>setFormCliente({...formCliente,cedula:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="Teléfono" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Dirección" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.clave} onChange={e=>setFormCliente({...formCliente,clave:e.target.value})} placeholder="Clave cliente" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <button className="col-span-5 bg-orange-500 text-black font-black py-3 rounded-xl">+ REGISTRAR CLIENTE</button>
            </form>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-zinc-800"><tr><th className="p-3 text-left">Cédula</th><th className="p-3 text-left">Nombre</th><th className="p-3">Clave</th><th className="p-3">Borrar</th></tr></thead>
              <tbody>{clientes.map(c=><tr key={c.id} className="border-t border-zinc-800"><td className="p-3">{c.cedula}</td><td className="p-3">{c.nombre}</td><td className="p-3">{c.clave}</td><td className="p-3 text-center"><button onClick={async()=>{if(confirm("¿Borrar?")){await supabase.from("clientes").delete().eq("id",c.id); cargarClientes()}}} className="bg-red-600 px-2 py-1 rounded text-xs">X</button></td></tr>)}</tbody></table>
            </div>
          </div>
        )}
        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Hojas de Trabajo</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 grid grid-cols-3 gap-3 relative">
              <div className="col-span-3 relative">
                <input value={formHoja.nombre_cliente} onChange={e=>buscarClientePorNombre(e.target.value)} placeholder="Escribe nombre cliente registrado" className="w-full p-3 rounded bg-zinc-800 border border-orange-500/50" required />
                {sugerencias.length>0 && <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-xl mt-1">{sugerencias.map(s=><button type="button" key={s.id} onClick={()=>{setFormHoja({...formHoja, cedula_cliente:s.cedula, nombre_cliente:s.nombre, telefono:s.telefono}); setSugerencias([])}} className="w-full text-left p-3 hover:bg-orange-500 hover:text-black text-sm"><b>{s.nombre}</b> - {s.cedula}</button>)}</div>}
              </div>
              <input value={formHoja.cedula_cliente} onChange={e=>setFormHoja({...formHoja,cedula_cliente:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.telefono} onChange={e=>setFormHoja({...formHoja,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.modelo_moto} onChange={e=>setFormHoja({...formHoja,modelo_moto:e.target.value})} placeholder="Modelo Moto" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formHoja.placa} onChange={e=>setFormHoja({...formHoja,placa:e.target.value})} placeholder="Placa" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.kilometraje} onChange={e=>setFormHoja({...formHoja,kilometraje:e.target.value})} placeholder="Km" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <textarea value={formHoja.problema} onChange={e=>setFormHoja({...formHoja,problema:e.target.value})} placeholder="Problema" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <textarea value={formHoja.trabajo_realizar} onChange={e=>setFormHoja({...formHoja,trabajo_realizar:e.target.value})} placeholder="Trabajo" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <input value={formHoja.repuestos} onChange={e=>setFormHoja({...formHoja,repuestos:e.target.value})} placeholder="Repuestos" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.mano_obra} onChange={e=>setFormHoja({...formHoja,mano_obra:e.target.value})} placeholder="Mano obra" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.costo_repuestos} onChange={e=>setFormHoja({...formHoja,costo_repuestos:e.target.value})} placeholder="Costo Rep" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <select value={formHoja.estado} onChange={e=>setFormHoja({...formHoja,estado:e.target.value})} className="p-3 rounded bg-zinc-800 border border-zinc-700"><option value="pendiente">Pendiente</option><option value="en_proceso">En Proceso</option><option value="terminado">Terminado</option><option value="entregado">Entregado</option></select>
              <button className="col-span-3 bg-orange-500 text-black font-black py-3 rounded-xl">+ CREAR HOJA</button>
            </form>
            <div className="grid gap-3">{hojas.map(h=><div key={h.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between"><div><p className="font-bold">{h.modelo_moto} - {h.placa} - {h.nombre_cliente} - ${Number(h.mano_obra)+Number(h.costo_repuestos)}</p></div><button onClick={()=>{const doc=new jsPDF(); doc.text(`${h.nombre_cliente} - ${h.modelo_moto} - Total $${Number(h.mano_obra)+Number(h.costo_repuestos)}`,10,10); doc.save(`Hoja_${h.placa}.pdf`)}} className="bg-white text-black px-3 py-1 rounded text-xs">PDF</button></div>)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
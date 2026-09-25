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
  const [puntosInput, setPuntosInput] = useState<{[key:string]: string}>({})

  const [formCliente, setFormCliente] = useState({cedula:"", nombre:"", telefono:"", direccion:"", clave:""})
  const [formHoja, setFormHoja] = useState({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" })
  const [sugerencias, setSugerencias] = useState<any[]>([])

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u); cargarClientes(); cargarHojas()
  }, [])

  const cargarClientes = async () => { const {data} = await supabase.from("clientes").select("*").order("puntos", {ascending:false}); if(data) setClientes(data) }
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

  const sumarPuntos = async (cliente:any) => {
    const cantidad = Number(puntosInput[cliente.id] || 0)
    if(cantidad === 0) return alert("Pon cuantos puntos le quieres sumar")
    const nuevos = (cliente.puntos || 0) + cantidad
    const {error} = await supabase.from("clientes").update({puntos: nuevos}).eq("id", cliente.id)
    if(error) alert(error.message); else { alert(`+${cantidad} puntos a ${cliente.nombre} ✅`); setPuntosInput({...puntosInput, [cliente.id]:""}); cargarClientes() }
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

  // VISTA CLIENTE CON PUNTOS
  if(user.rol === "cliente") {
    const clienteActual = clientes.find(c=> c.cedula === user.cedula) || user
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-[2rem] border border-zinc-800 mb-6">
            <h1 className="text-orange-500 font-black text-xl">KT MOTOS</h1>
            <h2 className="text-3xl font-black mt-2">Hola, {user.nombre} 👋</h2>
            <div className="mt-4 bg-black rounded-2xl p-4 flex justify-between items-center border border-orange-500/30">
              <div><p className="text-zinc-500 text-xs font-bold">TUS PUNTOS KT</p><p className="text-4xl font-black text-orange-500">{clienteActual?.puntos || 0}</p></div>
              <div className="text-5xl">🏆</div>
            </div>
            <p className="text-xs text-zinc-500 mt-3">* Acumula puntos con cada visita y canjealos por descuentos</p>
            <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-4 bg-red-600 px-4 py-2 rounded-xl font-bold w-full">Salir</button>
          </div>
          <h3 className="text-xl font-black mb-4">Mis Trabajos ({misHojas.length})</h3>
          <div className="grid gap-3">
            {misHojas.map(h=>(
              <div key={h.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <p className="font-black">{h.modelo_moto} - {h.placa} <span className="ml-2 text-xs bg-orange-500 text-black px-2 py-1 rounded">{h.estado.toUpperCase()}</span></p>
                <p className="text-sm mt-1 text-zinc-400">Total: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // VISTA ADMIN
  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre}</p>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="hojas"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>📋 Hojas</button>
        <button onClick={()=>setModulo("clientes")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="clientes"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>👥 Clientes + Puntos</button>
        <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {modulo==="clientes" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Clientes y Puntos KT</h2>
            <form onSubmit={crearCliente} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-5 gap-3">
              <input value={formCliente.cedula} onChange={e=>setFormCliente({...formCliente,cedula:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Dirección" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.clave} onChange={e=>setFormCliente({...formCliente,clave:e.target.value})} placeholder="Clave" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <button className="col-span-5 bg-orange-500 text-black font-black py-3 rounded-xl">+ REGISTRAR CLIENTE</button>
            </form>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-zinc-800"><tr><th className="p-3 text-left">Cliente</th><th className="p-3 text-center">Puntos</th><th className="p-3 text-center">Sumar</th><th className="p-3">Acción</th></tr></thead>
              <tbody>{clientes.map(c=>(
                <tr key={c.id} className="border-t border-zinc-800">
                  <td className="p-3"><b>{c.nombre}</b><br/><span className="text-xs text-zinc-500">{c.cedula}</span></td>
                  <td className="p-3 text-center"><span className="bg-orange-500 text-black font-black px-3 py-1 rounded-full">{c.puntos || 0}</span></td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <input type="number" value={puntosInput[c.id] || ""} onChange={e=>setPuntosInput({...puntosInput, [c.id]: e.target.value})} placeholder="+10" className="w-20 p-2 rounded bg-zinc-800 border border-zinc-700 text-center" />
                      <button onClick={()=>sumarPuntos(c)} className="bg-green-600 px-3 py-2 rounded-lg font-bold text-xs">+ SUMAR</button>
                    </div>
                  </td>
                  <td className="p-3 text-center"><button onClick={async()=>{if(confirm("¿Borrar?")){await supabase.from("clientes").delete().eq("id",c.id); cargarClientes()}}} className="bg-red-600 px-2 py-1 rounded text-xs">X</button></td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        )}
        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Hojas</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 grid grid-cols-3 gap-3 relative">
              <div className="col-span-3 relative">
                <input value={formHoja.nombre_cliente} onChange={e=>buscarClientePorNombre(e.target.value)} placeholder="Escribe nombre cliente" className="w-full p-3 rounded bg-zinc-800 border border-orange-500/50" required />
                {sugerencias.length>0 && <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-xl mt-1">{sugerencias.map(s=><button type="button" key={s.id} onClick={()=>{setFormHoja({...formHoja, cedula_cliente:s.cedula, nombre_cliente:s.nombre, telefono:s.telefono}); setSugerencias([])}} className="w-full text-left p-3 hover:bg-orange-500 hover:text-black text-sm"><b>{s.nombre}</b> ({s.puntos} pts) - {s.cedula}</button>)}</div>}
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
          </div>
        )}
      </div>
    </div>
  )
}
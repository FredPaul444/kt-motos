"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [hojas, setHojas] = useState<any[]>([])
  const [misHojas, setMisHojas] = useState<any[]>([])
  const [modulo, setModulo] = useState("hojas")
  const [puntosInput, setPuntosInput] = useState<{[key:string]: string}>({})
  const [formCliente, setFormCliente] = useState({cedula:"", nombre:"", telefono:"", direccion:"", clave:""})
  const [formHoja, setFormHoja] = useState({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" })
  const [sugerencias, setSugerencias] = useState<any[]>([])

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u); cargarClientes(); cargarHojas()
  }, [])

  const cargarClientes = async () => {
    const {data} = await supabase.from("clientes").select("*").order("nombre")
    if(data) setClientes(data)
  }

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
    const cantidad = Math.abs(Number(puntosInput[cliente.id] || 0))
    if(cantidad === 0) return alert("Pon cuantos puntos")
    const nuevos = (cliente.puntos || 0) + cantidad
    await supabase.from("clientes").update({puntos: nuevos}).eq("id", cliente.id)
    setPuntosInput({...puntosInput, [cliente.id]:""}); cargarClientes()
  }

  const restarPuntos = async (cliente:any) => {
    const cantidad = Math.abs(Number(puntosInput[cliente.id] || 0))
    if(cantidad === 0) return alert("Pon cuantos puntos")
    let nuevos = (cliente.puntos || 0) - cantidad
    if(nuevos < 0) nuevos = 0
    await supabase.from("clientes").update({puntos: nuevos}).eq("id", cliente.id)
    setPuntosInput({...puntosInput, [cliente.id]:""}); cargarClientes()
  }

  const borrarPuntos = async (cliente:any) => {
    if(!confirm(`¿Poner en 0 los puntos de ${cliente.nombre}?`)) return
    await supabase.from("clientes").update({puntos: 0}).eq("id", cliente.id)
    cargarClientes()
  }

  const crearHoja = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("hojas_trabajo").insert([{...formHoja, mano_obra: Number(formHoja.mano_obra||0), costo_repuestos: Number(formHoja.costo_repuestos||0), creado_por: user.cedula}])
    if(error) alert(error.message)
    else { alert("Hoja creada ✅"); setFormHoja({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" }); cargarHojas() }
  }

  const buscarClientePorNombre = (texto:string) => {
    setFormHoja({...formHoja, nombre_cliente: texto})
    if(texto.length < 2) { setSugerencias([]); return }
    setSugerencias(clientes.filter(c => c.nombre.toLowerCase().includes(texto.toLowerCase())).slice(0,5))
  }

  const actualizarEstado = async (id:string, nuevoEstado:string) => {
    await supabase.from("hojas_trabajo").update({estado: nuevoEstado}).eq("id", id); cargarHojas()
  }

  const generarPDF = (h:any) => {
    const doc = new jsPDF()
    doc.setFontSize(16); doc.text("KT MOTOS - HOJA DE TRABAJO", 20, 20)
    doc.setFontSize(11)
    doc.text(`Cliente: ${h.nombre_cliente} - ${h.cedula_cliente}`, 20, 35)
    doc.text(`Telefono: ${h.telefono}`, 20, 42)
    doc.text(`Moto: ${h.modelo_moto} - Placa: ${h.placa} - Km: ${h.kilometraje}`, 20, 49)
    doc.text(`Problema: ${h.problema}`, 20, 60)
    doc.text(`Trabajo: ${h.trabajo_realizar}`, 20, 75)
    doc.text(`Repuestos: ${h.repuestos}`, 20, 90)
    doc.text(`Mano Obra: $${h.mano_obra} - Repuestos: $${h.costo_repuestos}`, 20, 105)
    doc.text(`Total: $${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)} - Estado: ${h.estado}`, 20, 115)
    doc.save(`hoja-${h.placa}-${h.id.slice(0,5)}.pdf`)
  }

  if(!user) return <div className="p-10 bg-black text-white">Cargando...</div>

  if(user.rol === "cliente") {
    const clienteActual = clientes.find(c=> c.cedula === user.cedula)
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 mb-6 text-center">
            <h1 className="text-orange-500 font-black">KT MOTOS</h1>
            <h2 className="text-3xl font-black mt-2">Hola {user.nombre} 👋</h2>
            <div className="mt-4 bg-black rounded-2xl p-5 border border-orange-500/30">
              <p className="text-zinc-500 text-xs font-bold tracking-widest">TUS PUNTOS KT</p>
              <p className="text-6xl font-black text-orange-500 mt-1">{clienteActual?.puntos?? user.puntos?? 0}</p>
              <p className="text-xs text-zinc-600 mt-2">Canjealos por descuentos</p>
            </div>
            <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-6 bg-red-600 w-full py-3 rounded-xl font-black">Salir</button>
          </div>
          <h3 className="font-black text-xl mb-3">Mis Trabajos ({misHojas.length})</h3>
          <div className="grid gap-3">
            {misHojas.map(h=>(
              <div key={h.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <p className="font-black">{h.modelo_moto} - {h.placa} <span className="ml-2 text-xs bg-orange-500 text-black px-2 py-1 rounded-full">{h.estado.toUpperCase()}</span></p>
                <p className="text-sm mt-2 text-zinc-400">{h.trabajo_realizar}</p>
                <p className="text-sm mt-1 font-bold text-white">Total: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre}</p>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 mt-4 ${modulo==="hojas"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>📋 Hojas</button>
        <button onClick={()=>setModulo("clientes")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="clientes"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>👥 Clientes + Puntos</button>
        <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>
      <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0a]">
        {modulo==="clientes" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Clientes - Puntos KT</h2>
            <form onSubmit={crearCliente} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-5 gap-3">
              <input value={formCliente.cedula} onChange={e=>setFormCliente({...formCliente,cedula:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Dirección" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.clave} onChange={e=>setFormCliente({...formCliente,clave:e.target.value})} placeholder="Clave" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <button className="col-span-5 bg-orange-500 text-black font-black py-3 rounded-xl">+ REGISTRAR CLIENTE</button>
            </form>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800 text-zinc-400"><tr><th className="p-3 text-left">Cliente</th><th className="p-3 text-center">Puntos</th><th className="p-3 text-center">Control</th></tr></thead>
                <tbody>{clientes.map(c=>(
                  <tr key={c.id} className="border-t border-zinc-800">
                    <td className="p-3"><b>{c.nombre}</b><br/><span className="text-xs text-zinc-500">{c.cedula}</span></td>
                    <td className="p-3 text-center"><span className="bg-orange-500 text-black font-black px-4 py-1 rounded-full text-lg">{c.puntos || 0}</span></td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center items-center">
                        <input type="number" value={puntosInput[c.id] || ""} onChange={e=>setPuntosInput({...puntosInput, [c.id]: e.target.value})} placeholder="10" className="w-20 p-2 rounded bg-zinc-800 border border-zinc-700 text-center font-bold" />
                        <button onClick={()=>sumarPuntos(c)} className="bg-green-600 hover:bg-green-500 w-10 h-10 rounded-xl font-black text-xl flex items-center justify-center">+</button>
                        <button onClick={()=>restarPuntos(c)} className="bg-yellow-500 hover:bg-yellow-400 w-10 h-10 rounded-xl font-black text-xl text-black flex items-center justify-center">-</button>
                        <button onClick={()=>borrarPuntos(c)} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-xl font-bold text-xs">BORRAR</button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Nueva Hoja de Trabajo</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 grid grid-cols-3 gap-3 relative">
              <div className="col-span-3 relative">
                <input value={formHoja.nombre_cliente} onChange={e=>buscarClientePorNombre(e.target.value)} placeholder="Escribe nombre del cliente (buscador automático)" className="w-full p-3 rounded bg-zinc-800 border border-orange-500/50" required />
                {sugerencias.length>0 && <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-xl mt-1 shadow-2xl">{sugerencias.map(s=><button type="button" key={s.id} onClick={()=>{setFormHoja({...formHoja, cedula_cliente:s.cedula, nombre_cliente:s.nombre, telefono:s.telefono}); setSugerencias([])}} className="w-full text-left p-3 hover:bg-orange-500 hover:text-black text-sm border-b border-zinc-700"><b>{s.nombre}</b> - {s.puntos || 0} pts - {s.cedula}</button>)}</div>}
              </div>
              <input value={formHoja.cedula_cliente} onChange={e=>setFormHoja({...formHoja,cedula_cliente:e.target.value})} placeholder="Cédula cliente" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.telefono} onChange={e=>setFormHoja({...formHoja,telefono:e.target.value})} placeholder="Tel" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.modelo_moto} onChange={e=>setFormHoja({...formHoja,modelo_moto:e.target.value})} placeholder="Modelo Moto" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formHoja.placa} onChange={e=>setFormHoja({...formHoja,placa:e.target.value})} placeholder="Placa" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.kilometraje} onChange={e=>setFormHoja({...formHoja,kilometraje:e.target.value})} placeholder="Kilometraje" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <textarea value={formHoja.problema} onChange={e=>setFormHoja({...formHoja,problema:e.target.value})} placeholder="Problema reportado por el cliente" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <textarea value={formHoja.trabajo_realizar} onChange={e=>setFormHoja({...formHoja,trabajo_realizar:e.target.value})} placeholder="Trabajo a realizar" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <input value={formHoja.repuestos} onChange={e=>setFormHoja({...formHoja,repuestos:e.target.value})} placeholder="Repuestos necesarios" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.mano_obra} onChange={e=>setFormHoja({...formHoja,mano_obra:e.target.value})} placeholder="Mano de obra $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.costo_repuestos} onChange={e=>setFormHoja({...formHoja,costo_repuestos:e.target.value})} placeholder="Costo Repuestos $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <select value={formHoja.estado} onChange={e=>setFormHoja({...formHoja,estado:e.target.value})} className="p-3 rounded bg-zinc-800 border border-zinc-700"><option value="pendiente">Pendiente</option><option value="en_proceso">En Proceso</option><option value="terminado">Terminado</option><option value="entregado">Entregado</option></select>
              <button className="col-span-3 bg-orange-500 text-black font-black py-4 rounded-xl text-lg">+ CREAR HOJA</button>
            </form>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
              <h3 className="font-black mb-4 text-xl">Todas las Hojas ({hojas.length})</h3>
              <div className="grid gap-3">
                {hojas.map(h=>(
                  <div key={h.id} className="bg-black p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="font-black">{h.nombre_cliente} - {h.modelo_moto} ({h.placa})</p>
                      <p className="text-xs text-zinc-500">{h.problema?.slice(0,60)} | Total: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <select value={h.estado} onChange={e=>actualizarEstado(h.id, e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs">
                        <option value="pendiente">Pendiente</option><option value="en_proceso">En Proceso</option><option value="terminado">Terminado</option><option value="entregado">Entregado</option>
                      </select>
                      <button onClick={()=>generarPDF(h)} className="bg-white text-black px-3 py-2 rounded-lg font-bold text-xs">PDF</button>
                      <button onClick={async()=>{if(confirm("¿Borrar hoja?")){await supabase.from("hojas_trabajo").delete().eq("id", h.id); cargarHojas()}}} className="bg-red-600 px-3 py-2 rounded-lg font-bold text-xs">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modulo, setModulo] = useState("hojas")
  const [clientes, setClientes] = useState<any[]>([])
  const [hojas, setHojas] = useState<any[]>([])
  const [filtroCliente, setFiltroCliente] = useState("")
  const [busquedaHoja, setBusquedaHoja] = useState("")
  const [sugerencias, setSugerencias] = useState<any[]>([])

  // Form Cliente
  const [formCliente, setFormCliente] = useState({cedula:"", nombre:"", telefono:"", direccion:""})
  // Form Hoja
  const [formHoja, setFormHoja] = useState({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" })

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u); cargarClientes(); cargarHojas()
  }, [])

  const cargarClientes = async () => { const {data} = await supabase.from("clientes").select("*").order("nombre"); if(data) setClientes(data) }
  const cargarHojas = async () => { const {data} = await supabase.from("hojas_trabajo").select("*").order("created_at",{ascending:false}); if(data) setHojas(data) }

  const crearCliente = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("clientes").insert([formCliente])
    if(error) alert(error.message)
    else { alert("Cliente registrado ✅"); setFormCliente({cedula:"", nombre:"", telefono:"", direccion:""}); cargarClientes() }
  }
  const borrarCliente = async (id:string) => { if(!confirm("¿Borrar cliente?")) return; await supabase.from("clientes").delete().eq("id",id); cargarClientes() }

  // BUSCADOR INTELIGENTE PARA HOJA
  const buscarClientePorNombre = (texto:string) => {
    setFormHoja({...formHoja, nombre_cliente: texto})
    if(texto.length < 2) { setSugerencias([]); return }
    const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(texto.toLowerCase()))
    setSugerencias(filtrados.slice(0,5))
  }
  const seleccionarCliente = (c:any) => {
    setFormHoja({...formHoja, cedula_cliente:c.cedula, nombre_cliente:c.nombre, telefono:c.telefono})
    setSugerencias([])
  }

  const crearHoja = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("hojas_trabajo").insert([{...formHoja, mano_obra: Number(formHoja.mano_obra||0), costo_repuestos: Number(formHoja.costo_repuestos||0), creado_por: user.cedula}])
    if(error) alert(error.message)
    else { alert("Hoja creada ✅"); setFormHoja({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" }); cargarHojas() }
  }

  const imprimirPDF = (h:any) => {
    const doc = new jsPDF()
    doc.setFillColor(0,0,0); doc.rect(0,0,210,25,"F")
    doc.setTextColor(255,140,0); doc.setFontSize(20); doc.setFont("helvetica","bold"); doc.text("KT MOTOS",10,16)
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.text("HOJA DE TRABAJO", 130,16)
    doc.setTextColor(0,0,0); doc.setFontSize(11)
    doc.text(`Fecha: ${new Date(h.created_at).toLocaleString()} - Estado: ${h.estado}`,10,35)
    doc.text(`Cliente: ${h.nombre_cliente} (${h.cedula_cliente}) Tel: ${h.telefono}`,10,45)
    doc.text(`Moto: ${h.modelo_moto} Placa: ${h.placa} Km: ${h.kilometraje}`,10,52)
    doc.text(doc.splitTextToSize(`Problema: ${h.problema}`,190),10,62)
    doc.text(doc.splitTextToSize(`Trabajo: ${h.trabajo_realizar}`,190),10,80)
    doc.text(doc.splitTextToSize(`Repuestos: ${h.repuestos}`,190),10,100)
    doc.setFont("helvetica","bold"); doc.text(`TOTAL: $${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)} (Mano: $${h.mano_obra} + Rep: $${h.costo_repuestos})`,10,120)
    doc.save(`Hoja_${h.placa}_${h.nombre_cliente}.pdf`)
  }

  if(!user) return <div className="p-10 bg-black text-white">Cargando...</div>

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre}</p>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="hojas"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>📋 Hojas Trabajo</button>
        <button onClick={()=>setModulo("clientes")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="clientes"?"bg-orange-500 text-black":"bg-zinc-800 text-zinc-400"}`}>👥 Clientes</button>
        <button onClick={()=>{sessionStorage.clear(); localStorage.clear(); window.location.href="/"}} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {modulo==="clientes" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Registro de Clientes</h2>
            <form onSubmit={crearCliente} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 grid grid-cols-4 gap-3">
              <input value={formCliente.cedula} onChange={e=>setFormCliente({...formCliente,cedula:e.target.value})} placeholder="Cédula" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.nombre} onChange={e=>setFormCliente({...formCliente,nombre:e.target.value})} placeholder="Nombre completo" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formCliente.telefono} onChange={e=>setFormCliente({...formCliente,telefono:e.target.value})} placeholder="Teléfono" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formCliente.direccion} onChange={e=>setFormCliente({...formCliente,direccion:e.target.value})} placeholder="Dirección" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <button className="col-span-4 bg-orange-500 text-black font-black py-3 rounded-xl">+ REGISTRAR CLIENTE</button>
            </form>

            <input value={filtroCliente} onChange={e=>setFiltroCliente(e.target.value)} placeholder="Buscar cliente por nombre o cédula..." className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4" />

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-zinc-800 text-zinc-400"><tr><th className="p-3 text-left">Cédula</th><th className="p-3 text-left">Nombre</th><th className="p-3 text-left">Teléfono</th><th className="p-3">X</th></tr></thead>
              <tbody>{clientes.filter(c=> c.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) || c.cedula.includes(filtroCliente)).map(c=><tr key={c.id} className="border-t border-zinc-800"><td className="p-3">{c.cedula}</td><td className="p-3">{c.nombre}</td><td className="p-3">{c.telefono}</td><td className="p-3 text-center"><button onClick={()=>borrarCliente(c.id)} className="bg-red-600 px-2 py-1 rounded text-xs">Borrar</button></td></tr>)}</tbody></table>
            </div>
          </div>
        )}

        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Nueva Hoja de Trabajo</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
              <p className="text-orange-500 font-bold mb-3">Busca al cliente (escribe su nombre)</p>
              <div className="grid grid-cols-3 gap-3 relative">
                <div className="col-span-3 relative">
                  <input value={formHoja.nombre_cliente} onChange={e=>buscarClientePorNombre(e.target.value)} placeholder="Escribe nombre del cliente Ej: Carlos" className="w-full p-3 rounded bg-zinc-800 border border-orange-500/50 outline-none" required />
                  {sugerencias.length > 0 && (
                    <div className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-xl mt-1 overflow-hidden">
                      {sugerencias.map(s=>(
                        <button type="button" key={s.id} onClick={()=>seleccionarCliente(s)} className="w-full text-left p-3 hover:bg-orange-500 hover:text-black text-sm">
                          <b>{s.nombre}</b> - {s.cedula} - {s.telefono}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input value={formHoja.cedula_cliente} onChange={e=>setFormHoja({...formHoja,cedula_cliente:e.target.value})} placeholder="Cédula (auto)" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <input value={formHoja.telefono} onChange={e=>setFormHoja({...formHoja,telefono:e.target.value})} placeholder="Teléfono (auto)" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <input value={formHoja.modelo_moto} onChange={e=>setFormHoja({...formHoja,modelo_moto:e.target.value})} placeholder="Modelo Moto" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
                <input value={formHoja.placa} onChange={e=>setFormHoja({...formHoja,placa:e.target.value})} placeholder="Placa" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <input value={formHoja.kilometraje} onChange={e=>setFormHoja({...formHoja,kilometraje:e.target.value})} placeholder="Km" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <textarea value={formHoja.problema} onChange={e=>setFormHoja({...formHoja,problema:e.target.value})} placeholder="Problema que trae" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
                <textarea value={formHoja.trabajo_realizar} onChange={e=>setFormHoja({...formHoja,trabajo_realizar:e.target.value})} placeholder="Trabajo a realizar" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
                <input value={formHoja.repuestos} onChange={e=>setFormHoja({...formHoja,repuestos:e.target.value})} placeholder="Repuestos" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" />
                <input type="number" value={formHoja.mano_obra} onChange={e=>setFormHoja({...formHoja,mano_obra:e.target.value})} placeholder="Mano obra $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <input type="number" value={formHoja.costo_repuestos} onChange={e=>setFormHoja({...formHoja,costo_repuestos:e.target.value})} placeholder="Repuestos $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
                <select value={formHoja.estado} onChange={e=>setFormHoja({...formHoja,estado:e.target.value})} className="p-3 rounded bg-zinc-800 border border-zinc-700"><option value="pendiente">Pendiente</option><option value="en_proceso">En Proceso</option><option value="terminado">Terminado</option><option value="entregado">Entregado</option></select>
              </div>
              <button className="w-full mt-4 bg-orange-500 text-black font-black py-3 rounded-xl">+ CREAR HOJA</button>
            </form>

            <input value={busquedaHoja} onChange={e=>setBusquedaHoja(e.target.value)} placeholder="Buscar hoja por cliente o placa..." className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4" />
            <div className="grid gap-3">
              {hojas.filter(h=> h.nombre_cliente.toLowerCase().includes(busquedaHoja.toLowerCase()) || h.placa.toLowerCase().includes(busquedaHoja.toLowerCase())).map(h=>(
                <div key={h.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex justify-between">
                  <div><p className="font-black">{h.modelo_moto} - {h.placa} <span className="ml-2 text-xs bg-orange-500 text-black px-2 py-1 rounded">{h.estado}</span></p><p className="text-sm text-zinc-400">{h.nombre_cliente} - Total: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p></div>
                  <div className="flex gap-2"><button onClick={()=>imprimirPDF(h)} className="bg-white text-black px-4 py-2 rounded-lg font-black text-xs">PDF</button><button onClick={async()=>{if(confirm("¿Borrar?")){await supabase.from("hojas_trabajo").delete().eq("id",h.id); cargarHojas()}}} className="bg-red-600 px-3 py-2 rounded text-xs">X</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
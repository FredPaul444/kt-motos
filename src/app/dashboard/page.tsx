"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [modulo, setModulo] = useState("hojas")
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [hojas, setHojas] = useState<any[]>([])
  const [cedula, setCedula] = useState(""); const [nombre, setNombre] = useState(""); const [clave, setClave] = useState(""); const [rol, setRol] = useState("usuario")
  const [formHoja, setFormHoja] = useState({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" })

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null")
    if (!u) { window.location.href = "/"; return }
    setUser(u); cargarUsuarios(); cargarHojas()
  }, [])

  const cargarUsuarios = async () => { const {data} = await supabase.from("usuarios").select("*"); if(data) setUsuarios(data) }
  const cargarHojas = async () => { const {data} = await supabase.from("hojas_trabajo").select("*").order("created_at",{ascending:false}); if(data) setHojas(data) }

  const imprimirPDF = (h:any) => {
    const doc = new jsPDF()
    doc.setFillColor(0,0,0); doc.rect(0,0,210,25,"F")
    doc.setTextColor(255,140,0); doc.setFontSize(20); doc.setFont("helvetica","bold"); doc.text("KT MOTOS",10,16)
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.text("HOJA DE TRABAJO - TALLER", 120,16)
    
    doc.setTextColor(0,0,0); doc.setFontSize(12)
    doc.text(`Fecha: ${new Date(h.created_at).toLocaleString()}`,10,35)
    doc.text(`Estado: ${h.estado.toUpperCase()}`,10,42)
    doc.line(10,45,200,45)

    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.text("DATOS CLIENTE:",10,55)
    doc.setFont("helvetica","normal"); doc.text(`Cedula: ${h.cedula_cliente}`,10,62); doc.text(`Nombre: ${h.nombre_cliente}`,10,69); doc.text(`Telefono: ${h.telefono}`,10,76)
    
    doc.setFont("helvetica","bold"); doc.text("DATOS MOTO:",10,86)
    doc.setFont("helvetica","normal"); doc.text(`Modelo: ${h.modelo_moto}`,10,93); doc.text(`Placa: ${h.placa}`,10,100); doc.text(`Kilometraje: ${h.kilometraje}`,10,107)

    doc.setFont("helvetica","bold"); doc.text("DIAGNOSTICO / PROBLEMA:",10,118)
    doc.setFont("helvetica","normal"); doc.text(doc.splitTextToSize(h.problema || "-", 190),10,125)

    doc.setFont("helvetica","bold"); doc.text("TRABAJO A REALIZAR:",10,145)
    doc.setFont("helvetica","normal"); doc.text(doc.splitTextToSize(h.trabajo_realizar || "-", 190),10,152)

    doc.setFont("helvetica","bold"); doc.text("REPUESTOS:",10,172)
    doc.setFont("helvetica","normal"); doc.text(doc.splitTextToSize(h.repuestos || "-", 190),10,179)

    let y = 195
    doc.setFont("helvetica","bold"); doc.text(`Mano de obra: $${h.mano_obra}`,10,y); doc.text(`Repuestos: $${h.costo_repuestos}`,70,y)
    doc.setFontSize(13); doc.text(`TOTAL: $${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}`,10,y+10)

    doc.setFontSize(9); doc.setTextColor(100); doc.text("Firma Cliente: _________________________",10,240); doc.text("Firma Taller: _________________________",110,240)
    doc.text("Gracias por preferir KT MOTOS",10,280)

    doc.save(`Hoja_${h.placa}_${h.nombre_cliente}.pdf`)
  }

  const crearHoja = async (e:any) => {
    e.preventDefault()
    const {error} = await supabase.from("hojas_trabajo").insert([{...formHoja, mano_obra: Number(formHoja.mano_obra||0), costo_repuestos: Number(formHoja.costo_repuestos||0), creado_por: user.cedula}])
    if(error) alert(error.message); else { alert("Hoja creada ✅"); setFormHoja({ cedula_cliente:"", nombre_cliente:"", telefono:"", modelo_moto:"", placa:"", kilometraje:"", problema:"", trabajo_realizar:"", repuestos:"", mano_obra:"", costo_repuestos:"", estado:"pendiente" }); cargarHojas() }
  }

  const handleSalir = () => { sessionStorage.clear(); localStorage.clear(); window.location.href="/" }
  if(!user) return <div className="p-10 bg-black text-white">Cargando...</div>

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="font-black text-orange-500 text-xl">KT MOTOS</h1>
        <p className="text-xs text-zinc-500 mb-6">{user.nombre}</p>
        <button onClick={()=>setModulo("hojas")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="hojas"?"bg-orange-500 text-black":"text-zinc-400 bg-zinc-800"}`}>📋 Hojas de Trabajo</button>
        <button onClick={()=>setModulo("usuarios")} className={`w-full text-left px-4 py-3 rounded-xl font-bold mb-2 ${modulo==="usuarios"?"bg-orange-500 text-black":"text-zinc-400 bg-zinc-800"}`}>👥 Usuarios</button>
        <button onClick={handleSalir} className="mt-auto bg-red-600 py-3 rounded-xl font-black">Salir</button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {modulo==="hojas" && (
          <div>
            <h2 className="text-3xl font-black mb-6">Hojas de Trabajo</h2>
            <form onSubmit={crearHoja} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8 grid grid-cols-3 gap-3">
              <input value={formHoja.cedula_cliente} onChange={e=>setFormHoja({...formHoja,cedula_cliente:e.target.value})} placeholder="Cédula Cliente" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formHoja.nombre_cliente} onChange={e=>setFormHoja({...formHoja,nombre_cliente:e.target.value})} placeholder="Nombre Cliente" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formHoja.telefono} onChange={e=>setFormHoja({...formHoja,telefono:e.target.value})} placeholder="Teléfono" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.modelo_moto} onChange={e=>setFormHoja({...formHoja,modelo_moto:e.target.value})} placeholder="Modelo Moto" className="p-3 rounded bg-zinc-800 border border-zinc-700" required />
              <input value={formHoja.placa} onChange={e=>setFormHoja({...formHoja,placa:e.target.value})} placeholder="Placa" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input value={formHoja.kilometraje} onChange={e=>setFormHoja({...formHoja,kilometraje:e.target.value})} placeholder="Kilometraje" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <textarea value={formHoja.problema} onChange={e=>setFormHoja({...formHoja,problema:e.target.value})} placeholder="Problema" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <textarea value={formHoja.trabajo_realizar} onChange={e=>setFormHoja({...formHoja,trabajo_realizar:e.target.value})} placeholder="Trabajo a realizar" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" rows={2}></textarea>
              <input value={formHoja.repuestos} onChange={e=>setFormHoja({...formHoja,repuestos:e.target.value})} placeholder="Repuestos" className="col-span-3 p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.mano_obra} onChange={e=>setFormHoja({...formHoja,mano_obra:e.target.value})} placeholder="Mano obra $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <input type="number" value={formHoja.costo_repuestos} onChange={e=>setFormHoja({...formHoja,costo_repuestos:e.target.value})} placeholder="Costo repuestos $" className="p-3 rounded bg-zinc-800 border border-zinc-700" />
              <select value={formHoja.estado} onChange={e=>setFormHoja({...formHoja,estado:e.target.value})} className="p-3 rounded bg-zinc-800 border border-zinc-700"><option value="pendiente">Pendiente</option><option value="en_proceso">En Proceso</option><option value="terminado">Terminado</option><option value="entregado">Entregado</option></select>
              <button className="col-span-3 bg-orange-500 text-black font-black py-3 rounded-xl">+ CREAR HOJA</button>
            </form>

            <div className="grid gap-3">
              {hojas.map(h=>(
                <div key={h.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex justify-between items-start">
                  <div className="flex-1"><p className="font-black">{h.modelo_moto} - {h.placa} <span className="ml-2 text-xs bg-orange-500 text-black px-2 py-1 rounded">{h.estado}</span></p>
                  <p className="text-sm text-zinc-400">Cliente: {h.nombre_cliente} | Total: ${(Number(h.mano_obra)+Number(h.costo_repuestos)).toFixed(2)}</p></div>
                  <div className="flex gap-2">
                    <button onClick={()=>imprimirPDF(h)} className="bg-white text-black px-4 py-2 rounded-lg font-black text-xs hover:bg-orange-500">🖨️ PDF</button>
                    <button onClick={async()=>{if(confirm("¿Borrar?")){await supabase.from("hojas_trabajo").delete().eq("id",h.id); cargarHojas()}}} className="bg-red-600 px-3 py-2 rounded-lg text-xs">X</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {modulo==="usuarios" && <div><h2 className="text-2xl font-black mb-4">Usuarios - {usuarios.length}</h2><p className="text-zinc-500">Ya lo tienes del paso anterior</p></div>}
      </div>
    </div>
  )
}
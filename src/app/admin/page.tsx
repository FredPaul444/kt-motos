"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type ProdTemp = { stock_id: string, producto: string, monto: string, descripcion: string, cantidad: string }

export default function AdminPage(){
  const [tab,setTab] = useState<'clientes'|'stock'|'buscar'>('clientes')
  const [users,setUsers] = useState<any[]>([])
  const [stock,setStock] = useState<any[]>([])

  const [cedula,setCedula] = useState("")
  const [nombres,setNombres] = useState("")
  const [clave,setClave] = useState("")

  const [clienteSel,setClienteSel] = useState("")
  const [productos, setProductos] = useState<ProdTemp[]>([{ stock_id:"", producto:"", monto:"", descripcion:"", cantidad:"1" }])

  // STOCK FORM
  const [nombreStock,setNombreStock] = useState("")
  const [precioStock,setPrecioStock] = useState("")
  const [stockCant,setStockCant] = useState("")
  const [descStock,setDescStock] = useState("")

  const [buscarCedula,setBuscarCedula] = useState("")
  const [clienteEncontrado,setClienteEncontrado] = useState<any>(null)
  const [comprasCliente,setComprasCliente] = useState<any[]>([])

  const cargar = async()=>{
    const { data: u } = await supabase.from("usuarios").select("*").order("created_at",{ascending:false})
    if(u) setUsers(u)
    const { data: s } = await supabase.from("productos_stock").select("*").order("created_at",{ascending:false})
    if(s) setStock(s)
  }
  useEffect(()=>{ cargar() },[])

  const agregarCliente = async()=>{
    if(!cedula ||!nombres ||!clave) return alert("Llena todo")
    const { error } = await supabase.from("usuarios").insert([{ cedula, nombre: nombres, clave, rol: 'cliente' }])
    if(error) return alert(error.message)
    alert("Cliente agregado ✅"); setCedula(""); setNombres(""); setClave(""); cargar()
  }

  const agregarStock = async()=>{
    if(!nombreStock ||!precioStock) return alert("Nombre y precio obligatorio")
    const { error } = await supabase.from("productos_stock").insert([{ nombre: nombreStock, precio: parseFloat(precioStock), stock: parseInt(stockCant||"0"), descripcion: descStock }])
    if(error) return alert(error.message)
    alert("Producto al stock ✅"); setNombreStock(""); setPrecioStock(""); setStockCant(""); setDescStock(""); cargar()
  }

  const borrarStock = async(id:string)=>{
    if(!confirm("¿Borrar del stock?")) return
    await supabase.from("productos_stock").delete().eq("id",id); cargar()
  }

  const handleSelectStock = (index:number, stockId:string)=>{
    const nuevos = [...productos]
    const prodStock = stock.find(s=>s.id===stockId)
    if(prodStock){
      nuevos[index].stock_id = stockId
      nuevos[index].producto = prodStock.nombre
      nuevos[index].monto = String(prodStock.precio)
      nuevos[index].descripcion = prodStock.descripcion||""
    } else {
      nuevos[index].stock_id = ""
      nuevos[index].producto = ""
      nuevos[index].monto = ""
    }
    setProductos(nuevos)
  }

  const agregarFila = ()=> setProductos([...productos, { stock_id:"", producto:"", monto:"", descripcion:"", cantidad:"1" }])
  const quitarFila = (i:number)=> setProductos(productos.filter((_,idx)=>idx!==i))

  const registrarCompras = async()=>{
    if(!clienteSel) return alert("Selecciona cliente")
    const validos = productos.filter(p=>p.producto && p.monto)
    if(validos.length===0) return alert("Selecciona productos")
    const paraInsertar = validos.map(p=>({
      cedula_cliente: clienteSel,
      producto: p.producto,
      monto: parseFloat(p.monto),
      descripcion: p.descripcion,
      cantidad: parseInt(p.cantidad||"1")
    }))
    const { error } = await supabase.from("compras").insert(paraInsertar)
    if(error) return alert(error.message)
    alert(`${validos.length} productos a ${clienteSel} ✅`)
    setProductos([{ stock_id:"", producto:"", monto:"", descripcion:"", cantidad:"1" }])
  }

  const buscarCliente = async()=>{
    if(!buscarCedula) return
    const { data } = await supabase.from("usuarios").select("*").eq("cedula", buscarCedula).single()
    if(!data){ alert("No encontrado"); return }
    setClienteEncontrado(data)
    const { data: comp } = await supabase.from("compras").select("*").eq("cedula_cliente", buscarCedula).order("created_at",{ascending:false})
    if(comp) setComprasCliente(comp)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center"><h1 className="text-xl font-bold text-orange-500">KT MOTOS - ADMIN</h1><button onClick={()=>{localStorage.clear(); location.href="/"}} className="bg-red-600 px-3 py-1 rounded text-sm">Salir</button></div>

      <div className="flex gap-2 mt-4">
        <button onClick={()=>setTab('clientes')} className={`px-4 py-2 rounded font-bold ${tab==='clientes'?'bg-orange-600':'bg-zinc-800'}`}>Clientes / Ventas</button>
        <button onClick={()=>setTab('stock')} className={`px-4 py-2 rounded font-bold ${tab==='stock'?'bg-orange-600':'bg-zinc-800'}`}>Stock ({stock.length})</button>
        <button onClick={()=>setTab('buscar')} className={`px-4 py-2 rounded font-bold ${tab==='buscar'?'bg-orange-600':'bg-zinc-800'}`}>🔍 Buscar</button>
      </div>

      {tab==='clientes' && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-zinc-900 p-5 rounded-xl h-fit">
            <h2 className="font-bold mb-3">Agregar Cliente</h2>
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="Cédula" className="w-full p-3 mb-2 rounded bg-zinc-800" />
            <input value={nombres} onChange={e=>setNombres(e.target.value)} placeholder="Nombres" className="w-full p-3 mb-2 rounded bg-zinc-800" />
            <input value={clave} onChange={e=>setClave(e.target.value)} placeholder="Clave" className="w-full p-3 mb-2 rounded bg-zinc-800" />
            <button onClick={agregarCliente} className="w-full bg-zinc-700 p-3 rounded font-bold">Guardar</button>
          </div>

          <div className="bg-zinc-900 p-5 rounded-xl h-fit border border-orange-500/30">
            <h2 className="font-bold mb-3 text-orange-400">Vender (desde Stock)</h2>
            <select value={clienteSel} onChange={e=>setClienteSel(e.target.value)} className="w-full p-3 mb-4 rounded bg-zinc-800">
              <option value="">Selecciona Cliente...</option>
              {users.filter(u=>u.rol!=='admin').map(u=>(<option key={u.cedula} value={u.cedula}>{u.cedula} - {u.nombre}</option>))}
            </select>

            {productos.map((p,i)=>(
              <div key={i} className="bg-black p-3 rounded-xl mb-3 border border-zinc-800">
                <select value={p.stock_id} onChange={e=>handleSelectStock(i, e.target.value)} className="w-full p-2 mb-2 rounded bg-zinc-800 text-sm">
                  <option value="">-- Elige del Stock --</option>
                  {stock.map(s=>(<option key={s.id} value={s.id}>{s.nombre} - ${s.precio} (Stock: {s.stock})</option>))}
                </select>
                <div className="flex gap-2 text-sm"><input value={p.producto} readOnly placeholder="Nombre auto" className="flex-1 p-2 rounded bg-zinc-900 text-zinc-400" /><input value={p.monto} readOnly placeholder="$ auto" className="w-24 p-2 rounded bg-zinc-900 text-green-400" /></div>
                {productos.length>1 && <button onClick={()=>quitarFila(i)} className="text-red-500 text-xs mt-2">Quitar</button>}
              </div>
            ))}
            <button onClick={agregarFila} className="w-full bg-zinc-800 p-2 rounded text-sm mb-3">+ Otro producto</button>
            <button onClick={registrarCompras} className="w-full bg-orange-600 p-3 rounded font-bold">Registrar Venta 💰</button>
          </div>
        </div>
      )}

      {tab==='stock' && (
        <div className="mt-6">
          <div className="bg-zinc-900 p-5 rounded-xl">
            <h2 className="font-bold mb-3">Agregar Producto al Stock</h2>
            <div className="grid grid-cols-2 gap-2">
              <input value={nombreStock} onChange={e=>setNombreStock(e.target.value)} placeholder="Nombre: Motor 200" className="p-3 rounded bg-zinc-800" />
              <input value={precioStock} onChange={e=>setPrecioStock(e.target.value)} type="number" placeholder="Precio" className="p-3 rounded bg-zinc-800" />
              <input value={stockCant} onChange={e=>setStockCant(e.target.value)} type="number" placeholder="Stock ej: 10" className="p-3 rounded bg-zinc-800" />
              <input value={descStock} onChange={e=>setDescStock(e.target.value)} placeholder="Descripción" className="p-3 rounded bg-zinc-800" />
            </div>
            <button onClick={agregarStock} className="w-full mt-3 bg-orange-600 p-3 rounded font-bold">Guardar en Stock</button>
          </div>

          <div className="bg-zinc-900 p-5 rounded-xl mt-6">
            <h2 className="font-bold mb-3">Mi Stock ({stock.length})</h2>
            <table className="w-full text-sm"><thead className="text-zinc-500"><tr><th className="text-left p-2">Nombre</th><th className="text-left">Precio</th><th className="text-left">Stock</th><th>Acción</th></tr></thead>
            <tbody>{stock.map((s:any)=>(<tr key={s.id} className="border-t border-zinc-800"><td className="p-2 font-bold">{s.nombre}</td><td className="text-green-400">${s.precio}</td><td>{s.stock}</td><td><button onClick={()=>borrarStock(s.id)} className="bg-red-600 px-2 py-1 rounded text-xs">Borrar</button></td></tr>))}</tbody></table>
          </div>
        </div>
      )}

      {tab==='buscar' && (
        <div className="bg-zinc-900 p-5 rounded-xl mt-6">
          <h2 className="font-bold mb-3">🔍 Buscar Cliente por Cédula</h2>
          <div className="flex gap-2"><input value={buscarCedula} onChange={e=>setBuscarCedula(e.target.value)} placeholder="0401740998" className="flex-1 p-3 rounded bg-zinc-800" /><button onClick={buscarCliente} className="bg-orange-600 px-6 rounded font-bold">Buscar</button></div>
          {clienteEncontrado && (
            <div className="mt-6 bg-black p-4 rounded-xl">
              <div className="flex justify-between"><p className="font-bold">{clienteEncontrado.nombre} ({clienteEncontrado.cedula}) - {comprasCliente.length} compras</p><button onClick={()=>{setClienteEncontrado(null); setBuscarCedula("")}} className="bg-zinc-800 px-3 py-1 rounded text-xs">✕ Cerrar</button></div>
              <table className="w-full text-sm mt-3"><tbody>{comprasCliente.map((c:any)=>(<tr key={c.id} className="border-t border-zinc-800"><td className="p-2">{c.fecha}</td><td>{c.producto}</td><td className="text-green-400">${c.monto}</td></tr>))}</tbody></table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
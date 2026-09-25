"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SuperAdmin(){
  const [user,setUser]=useState<any>(null)
  const [usuarios,setUsuarios]=useState<any[]>([])
  const [cedula,setCedula]=useState("")
  const [nombre,setNombre]=useState("")
  const [clave,setClave]=useState("")
  const [rol,setRol]=useState("cliente")

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("user")||"null")
    if(!u || u.rol!=="super_usuario"){ window.location.href="/"; return }
    setUser(u)
    cargarUsuarios()
  },[])

  const cargarUsuarios = async()=>{
    const {data} = await supabase.from("usuarios").select("*").order("rol")
    if(data) setUsuarios(data)
  }

  const crearUsuario = async()=>{
    if(!cedula || !nombre || !clave) { alert("Llena todo"); return }
    const {error} = await supabase.from("usuarios").insert([{cedula, nombre, clave, rol}])
    if(error){ alert("Error: " + error.message); return }
    alert("Creado!")
    setCedula(""); setNombre(""); setClave("")
    cargarUsuarios()
  }

  const eliminar = async(id:string)=>{
    if(!confirm("¿Seguro eliminar?")) return
    await supabase.from("usuarios").delete().eq("id",id)
    cargarUsuarios()
  }

  if(!user) return null
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-500">SUPER USUARIO - {user.nombre}</h1>
        
        <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
          <h2 className="font-bold mb-4">Crear Nuevo Usuario</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="Cédula" className="p-3 rounded bg-zinc-800" />
            <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre" className="p-3 rounded bg-zinc-800" />
            <input value={clave} onChange={e=>setClave(e.target.value)} placeholder="Contraseña" className="p-3 rounded bg-zinc-800" />
            <select value={rol} onChange={e=>setRol(e.target.value)} className="p-3 rounded bg-zinc-800">
              <option value="cliente">Cliente</option>
              <option value="usuario">Usuario / Empleado</option>
              <option value="super_usuario">Super Usuario</option>
            </select>
          </div>
          <button onClick={crearUsuario} className="w-full mt-4 bg-orange-600 p-3 rounded font-bold">Crear</button>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl mt-6">
          <h2 className="font-bold mb-4">Todos los usuarios ({usuarios.length})</h2>
          <table className="w-full text-sm">
            <thead className="text-zinc-400"><tr><th className="text-left p-2">Cédula</th><th className="text-left">Nombre</th><th>Rol</th><th></th></tr></thead>
            <tbody>
              {usuarios.map(u=>(
                <tr key={u.id} className="border-t border-zinc-800">
                  <td className="p-2">{u.cedula}</td>
                  <td>{u.nombre}</td>
                  <td><span className={`px-2 py-1 rounded text-xs ${u.rol==='super_usuario'?'bg-orange-600':u.rol==='usuario'?'bg-blue-600':'bg-green-600'}`}>{u.rol}</span></td>
                  <td><button onClick={()=>eliminar(u.id)} className="text-red-400">X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={()=>{localStorage.clear(); window.location.href="/"}} className="mt-6 bg-zinc-800 p-3 rounded">Salir</button>
      </div>
    </div>
  )
}
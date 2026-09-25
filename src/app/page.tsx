"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Login(){
  const [cedula,setCedula]=useState("")
  const [pass,setPass]=useState("")

  const login = async()=>{
    const { data, error } = await supabase.from("usuarios").select("*").eq("cedula",cedula.trim()).eq("clave",pass.trim())
    if(error ||!data || data.length===0){ alert("Cedula o clave mala"); return }
    const user = data[0]
    localStorage.setItem("user", JSON.stringify(user))

    // 3 NIVELES DE ACCESO
    if(user.rol==="super_usuario"){
      window.location.href="/super-admin"
    } else if(user.rol==="usuario"){
      window.location.href="/usuario"
    } else {
      window.location.href="/cliente"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-96">
        <h1 className="text-2xl font-bold text-orange-500 mb-6 text-center">KT MOTOS</h1>
        <input placeholder="Cedula" value={cedula} onChange={e=>setCedula(e.target.value)} className="w-full p-3 mb-3 rounded bg-zinc-800" />
        <input type="password" placeholder="Contraseña" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-3 mb-4 rounded bg-zinc-800" />
        <button onClick={login} className="w-full bg-orange-600 p-3 rounded font-bold">Entrar</button>
      </div>
    </div>
  )
}
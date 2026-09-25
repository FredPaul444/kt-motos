"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [cedula, setCedula] = useState("")
  const [clave, setClave] = useState("")

  const handleLogin = async (e:any) => {
    e.preventDefault()

    // 1. Intenta como usuario / super_usuario
    let { data: userData } = await supabase.from("usuarios").select("*").eq("cedula", cedula).eq("clave", clave).single()

    if (userData) {
      sessionStorage.setItem("user", JSON.stringify(userData))
      window.location.href = "/dashboard"
      return
    }

    // 2. Intenta como CLIENTE
    let { data: clienteData } = await supabase.from("clientes").select("*").eq("cedula", cedula).eq("clave", clave).single()

    if (clienteData) {
      // lo guardamos como cliente
      const clienteUser = {...clienteData, rol: "cliente", nombre: clienteData.nombre }
      sessionStorage.setItem("user", JSON.stringify(clienteUser))
      window.location.href = "/dashboard"
      return
    }

    alert("Cédula o clave incorrecta")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm">
        <h1 className="text-2xl font-black text-orange-500 text-center">KT MOTOS</h1>
        <p className="text-zinc-500 text-center text-sm mb-6">Ingreso Portal</p>
        <input value={cedula} onChange={e=>setCedula(e.target.value)} placeholder="Cédula" className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-3" required />
        <input type="password" value={clave} onChange={e=>setClave(e.target.value)} placeholder="Clave" className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4" required />
        <button className="w-full bg-orange-500 text-black font-black py-3 rounded-xl">ENTRAR</button>
      </form>
    </div>
  )
}
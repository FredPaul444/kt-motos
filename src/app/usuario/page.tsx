"use client"
import { useEffect, useState } from "react"
export default function UsuarioPage(){
  const [user,setUser]=useState<any>(null)
  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("user")||"null")
    if(!u || u.rol!=="usuario"){ window.location.href="/"; return }
    setUser(u)
  },[])
  if(!user) return null
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold text-blue-400">USUARIO / VENDEDOR - {user.nombre}</h1>
      <p className="mt-4">Puedes agregar clientes y registrar pagos.</p>
      <button onClick={()=>{localStorage.clear(); window.location.href="/"}} className="mt-6 bg-zinc-800 p-3 rounded">Salir</button>
    </div>
  )
}
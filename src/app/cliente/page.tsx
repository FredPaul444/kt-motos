"use client"
import { useEffect, useState } from "react"

export default function ClientePage(){
  const [user,setUser]=useState<any>(null)
  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem("user")||"null")
    if(!u){ window.location.href="/"; return }
    // SI ERES SUPER, PA FUERA DE AQUI
    if(u.rol==="super_usuario"){ window.location.href="/super-admin"; return }
    if(u.rol==="usuario"){ window.location.href="/usuario"; return }
    setUser(u)
  },[])
  if(!user) return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold text-green-400">PORTAL CLIENTE - {user.nombre}</h1>
      <button onClick={()=>{localStorage.clear(); location.href="/"}} className="mt-6 bg-zinc-800 p-3 rounded">Salir</button>
    </div>
  )
}
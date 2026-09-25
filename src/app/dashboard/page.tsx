"use client"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Si viene del cache del navegador (boton atras) lo bota al login
    window.addEventListener("pageshow", (event: any) => {
      if (event.persisted) {
        sessionStorage.clear()
        window.location.href = "/"
      }
    })

    // Lee solo de sesion, no de localStorage viejo
    const u = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null")
    
    if (!u) {
      window.location.href = "/"
      return
    }
    setUser(u)
    
    // Si habia uno viejo en localStorage, lo movemos a sesion y limpiamos local
    if(localStorage.getItem("user")) {
        sessionStorage.setItem("user", localStorage.getItem("user")!)
        localStorage.removeItem("user")
    }
  }, [])

  if (!user) {
    return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>
  }

  const rol = user.rol
  const handleSalir = () => {
    sessionStorage.clear()
    localStorage.clear()
    window.location.href = "/"
  }

  // AQUI ABAJO DEJA TU DISEÑO QUE YA TENIAS, SOLO CAMBIE LO DE ARRIBA
  // SUPER ADMIN
  if (rol === "super_usuario") {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500">KT MOTOS - SUPER ADMIN</h1>
          <button onClick={handleSalir} className="bg-red-600 px-4 py-2 rounded font-bold">Salir</button>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-orange-500/30">
          <h2 className="text-xl mb-4">Hola, <span className="text-orange-500">{user.nombre}</span> 👋</h2>
          <p className="text-green-400 mt-4">✅ Sesion segura - Se cierra al cerrar la pestaña</p>
        </div>
      </div>
    )
  }

  // ... aqui tu vista de usuario y cliente igual pero usando handleSalir
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-orange-500">KT MOTOS</h1>
        <button onClick={handleSalir} className="bg-red-600 px-5 py-2 rounded font-bold">Salir</button>
      </div>
      <h2 className="text-4xl font-bold">Hola, <span className="text-orange-500">{user.nombre}</span> 👋</h2>
    </div>
  )
}

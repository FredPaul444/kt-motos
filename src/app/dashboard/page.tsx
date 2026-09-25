"use client"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null")
    if (!u) {
      window.location.href = "/"
      return
    }
    setUser(u)
  }, [])

  if (!user) {
    return <div className="min-h-screen bg-black text-white p-10">Cargando...</div>
  }

  // LOGICA DE ROLES - ESTO ES LO QUE FALTABA
  const rol = user.rol

  const handleSalir = () => {
    localStorage.clear()
    window.location.href = "/"
  }

  // VISTA SUPER ADMIN
  if (rol === "super_usuario") {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500">KT MOTOS - SUPER ADMIN</h1>
          <button onClick={handleSalir} className="bg-red-600 px-4 py-2 rounded font-bold">Salir</button>
        </div>
        
        <div className="bg-zinc-900 p-6 rounded-xl border border-orange-500/30">
          <h2 className="text-xl mb-4">Hola, <span className="text-orange-500">{user.nombre}</span> 👋</h2>
          <p className="text-zinc-400 mb-6">Cédula: {user.cedula} | Rol: {rol}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-400 text-sm">Total Usuarios</p>
              <p className="text-2xl font-bold">3 Registrados</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-400 text-sm">Ventas Hoy</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg border border-orange-500/50">
              <p className="text-zinc-400 text-sm">Acceso</p>
              <p className="text-2xl font-bold text-orange-500">Total</p>
            </div>
          </div>
          <p className="mt-8 text-green-400">✅ Ya estás en el panel correcto de Super Usuario</p>
        </div>
      </div>
    )
  }

  // VISTA EMPLEADO / USUARIO
  if (rol === "usuario") {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-500">KT MOTOS - EMPLEADO</h1>
          <button onClick={handleSalir} className="bg-red-600 px-4 py-2 rounded">Salir</button>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl">
          <h2 className="text-xl">Hola, {user.nombre} 👋</h2>
          <p className="text-zinc-400">Portal de vendedor</p>
        </div>
      </div>
    )
  }

  // VISTA CLIENTE - LA QUE TE SALE EN LA FOTO
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold text-orange-500">KT MOTOS</h1>
        <button onClick={handleSalir} className="bg-red-600 px-5 py-2 rounded font-bold">Salir</button>
      </div>
      <div className="p-6">
        <h2 className="text-4xl font-bold mb-2">Hola, <span className="text-orange-500">{user.nombre}</span> 👋</h2>
        <p className="text-zinc-400 mb-6">Bienvenido a tu portal de cliente</p>
        
        <div className="space-y-4">
          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400 text-sm">Cédula</p>
            <p className="text-xl font-bold">{user.cedula}</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="text-zinc-400 text-sm">Compras</p>
            <p className="text-xl font-bold">0 registradas</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl border border-orange-500/30">
            <p className="text-zinc-400 text-sm">Beneficios</p>
            <p className="text-xl font-bold">0 Activos</p>
          </div>
          <div className="bg-zinc-900 p-5 rounded-2xl">
            <p className="font-bold">Mis Compras 🛒</p>
            <p className="text-zinc-500 mt-2">Aún no tienes compras registradas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
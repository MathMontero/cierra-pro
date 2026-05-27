'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [autorizado, setAutorizado] = useState(false)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
  const cargar = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: perfil } = await supabase
      .from('users')
      .select('es_admin')
      .eq('id', user.id)
      .single()

    console.log('perfil admin:', perfil)

    if (!perfil?.es_admin) {
      window.location.href = '/dashboard'
      return
    }

    setAutorizado(true)

    const [
      { data: users },
      { count: totalClientes },
      { count: totalSeguimientos }
    ] = await Promise.all([
      supabase.from('users').select('*').order('fecha_registro', { ascending: false }),
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('seguimientos').select('*', { count: 'exact', head: true }),
    ])

    setUsuarios(users || [])
    setStats({
      totalUsuarios: users?.length || 0,
      totalClientes: totalClientes || 0,
      totalSeguimientos: totalSeguimientos || 0,
    })
    setLoading(false)
  }
  cargar()
}, [])

  const toggleAdmin = async (userId: string, esAdmin: boolean) => {
    await supabase.from('users').update({ es_admin: !esAdmin }).eq('id', userId)
    setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, es_admin: !esAdmin } : u))
  }

  if (loading && !autorizado) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Verificando acceso...</p>
    </div>
  )

  if (!autorizado) return null

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">⚡ Panel Admin</h1>
          <p className="text-gray-400 text-xs mt-1">Solo visible para admins</p>
        </div>
        <button onClick={() => window.location.href = '/dashboard'} className="text-gray-400 text-sm hover:text-white">← Dashboard</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '👤', label: 'Usuarios', valor: stats.totalUsuarios },
            { emoji: '👥', label: 'Clientes', valor: stats.totalClientes },
            { emoji: '⏰', label: 'Seguimientos', valor: stats.totalSeguimientos },
          ].map((m, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-3 border border-gray-800 text-center">
              <p className="text-xl mb-1">{m.emoji}</p>
              <p className="text-white font-bold text-lg">{m.valor}</p>
              <p className="text-gray-400 text-xs">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-white font-semibold text-sm">Usuarios registrados</p>
          </div>
          <div className="divide-y divide-gray-800">
            {usuarios.map(u => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{u.email}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {u.modo_uso} · {new Date(u.fecha_registro).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {u.es_admin && (
                    <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-lg">admin</span>
                  )}
                  <button
                    onClick={() => toggleAdmin(u.id, u.es_admin)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                      u.es_admin ? 'bg-red-900 text-red-400' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {u.es_admin ? 'Quitar' : 'Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
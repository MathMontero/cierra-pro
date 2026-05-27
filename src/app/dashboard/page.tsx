'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { pedirPermisoNotificaciones, registrarServiceWorker } from '@/lib/notificaciones'

const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function DashboardPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [seguimientos, setSeguimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    const init = async () => {
      await pedirPermisoNotificaciones()
      await registrarServiceWorker()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const hoy = new Date().toISOString().split('T')[0]
      const [{ data: clientesData }, { data: segsData }, { data: perfil }] = await Promise.all([
        supabase.from('clientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('seguimientos').select('*, clientes(nombre, telefono)').eq('completado', false).lte('fecha', hoy + 'T23:59:59'),
        supabase.from('users').select('es_admin').eq('id', user.id).single(),
      ])
      setClientes(clientesData || [])
      setSeguimientos(segsData || [])
      setEsAdmin(perfil?.es_admin || false)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const vendidos = clientes.filter(c => c.estado === 'vendido')
  const calientes = clientes.filter(c => c.prioridad === 'alta')

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/estadisticas'} className="text-xs text-gray-400 hover:text-white">📈</button>
            <button onClick={() => window.location.href = '/configuracion'} className="text-xs text-gray-400 hover:text-white">⚙️</button>
            {esAdmin && (
              <button onClick={() => window.location.href = '/admin'} className="text-xs text-gray-400 hover:text-white">👑</button>
            )}
            <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} className="text-xs text-gray-400 hover:text-white">Salir</button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => window.location.href = '/clientes'} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 cursor-pointer hover:border-blue-500 transition-all">
            <p className="text-2xl mb-1">👥</p>
            <p className="text-xs text-gray-400 mb-1">Clientes activos</p>
            <p className="text-2xl font-bold text-white">{clientes.length}</p>
          </div>
          <div onClick={() => window.location.href = '/clientes'} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 cursor-pointer hover:border-blue-500 transition-all">
            <p className="text-2xl mb-1">📈</p>
            <p className="text-xs text-gray-400 mb-1">Ventas cerradas</p>
            <p className="text-2xl font-bold text-white">{vendidos.length}</p>
          </div>
          <div onClick={() => window.location.href = '/seguimientos'} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 cursor-pointer hover:border-purple-500 transition-all">
            <p className="text-2xl mb-1">⏰</p>
            <p className="text-xs text-gray-400 mb-1">Seguimientos hoy</p>
            <p className="text-2xl font-bold text-white">{seguimientos.length}</p>
          </div>
          <div onClick={() => window.location.href = '/radar'} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 cursor-pointer hover:border-green-500 transition-all">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xs text-gray-400 mb-1">Radar</p>
            <p className="text-2xl font-bold text-white">{calientes.length}</p>
          </div>
        </div>

        <button onClick={() => window.location.href = '/clientes/nuevo'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors">
          ＋ Nuevo Cliente
        </button>

        <button onClick={() => window.location.href = '/importar'} className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 font-semibold py-3 rounded-2xl text-sm transition-colors border border-gray-800">
          📂 Importar clientes desde Excel/CSV
        </button>

        <button onClick={() => window.location.href = '/reactivacion'} className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 font-semibold py-3 rounded-2xl text-sm transition-colors border border-gray-800">
          ♻️ Reactivar clientes inactivos
        </button>

        {seguimientos.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 mb-3">⏰ SEGUIMIENTOS HOY</h2>
            <div className="space-y-2">
              {seguimientos.slice(0, 3).map(s => (
                <div key={s.id} className="bg-gray-900 rounded-xl p-3 border border-purple-900 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{s.clientes?.nombre}</p>
                    <p className="text-gray-400 text-xs">{s.tipo} · {s.observaciones}</p>
                  </div>
                  {s.clientes?.telefono && (
                    <a href={`https://wa.me/${s.clientes.telefono}`} className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center text-green-400 text-sm">💬</a>
                  )}
                </div>
              ))}
              {seguimientos.length > 3 && (
                <button onClick={() => window.location.href = '/seguimientos'} className="w-full text-center text-blue-400 text-sm py-2">
                  Ver todos ({seguimientos.length}) →
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">CLIENTES RECIENTES</h2>
          {clientes.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-white font-medium">Sin clientes todavía</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientes.slice(0, 5).map(c => (
                <div key={c.id} onClick={() => window.location.href = `/clientes/${c.id}`} className="bg-gray-900 rounded-xl p-3 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">{c.nombre.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-white font-medium text-sm">{c.nombre}</p>
                      <p className="text-gray-400 text-xs">{c.producto || 'Sin producto'} · {c.estado}</p>
                    </div>
                  </div>
                  {c.telefono && (
                    <a href={`https://wa.me/${c.telefono}`} onClick={e => e.stopPropagation()} className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center text-green-400 text-sm">💬</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-3">
        {NAV.map((n, i) => (
          <button key={i} onClick={() => window.location.href = n.href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <span className="text-xl">{n.emoji}</span>
            <span className="text-xs">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const ESTADOS = ['todos', 'nuevo', 'seguimiento', 'financiera', 'aprobado', 'vendido', 'perdido']
const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [filtro, setFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setClientes(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const clientesFiltrados = clientes
    .filter(c => filtro === 'todos' || c.estado === filtro)
    .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Clientes</h1>
          <button onClick={() => window.location.href = '/clientes/nuevo'} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
            + Nuevo
          </button>
        </div>
        <input
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-3"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltro(e)} className={'px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ' + (filtro === e ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400')}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-white font-medium">Sin clientes</p>
            <p className="text-gray-400 text-sm mt-1">{filtro !== 'todos' ? 'Probá otro filtro' : 'Agregá tu primer cliente'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clientesFiltrados.map(c => (
              <div key={c.id} onClick={() => window.location.href = '/clientes/' + c.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-lg">{c.nombre.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-white font-medium">{c.nombre}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{c.producto || 'Sin producto'}{c.monto_estimado ? ' · $' + Number(c.monto_estimado).toLocaleString() : ''}</p>
                  </div>
                </div>
                <span className={'text-xs px-2 py-1 rounded-lg font-medium ' + (c.estado === 'vendido' ? 'bg-green-900 text-green-400' : c.estado === 'perdido' ? 'bg-red-900 text-red-400' : c.estado === 'aprobado' ? 'bg-yellow-900 text-yellow-400' : 'bg-gray-800 text-gray-400')}>
                  {c.estado}
                </span>
              </div>
            ))}
          </div>
        )}
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
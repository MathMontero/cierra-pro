'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const ETAPAS = [
  { key: 'nuevo', label: 'Consulta', color: 'bg-blue-900', text: 'text-blue-400', border: 'border-blue-800' },
  { key: 'seguimiento', label: 'Seguimiento', color: 'bg-purple-900', text: 'text-purple-400', border: 'border-purple-800' },
  { key: 'financiera', label: 'Financiera', color: 'bg-yellow-900', text: 'text-yellow-400', border: 'border-yellow-800' },
  { key: 'aprobado', label: 'Aprobado', color: 'bg-orange-900', text: 'text-orange-400', border: 'border-orange-800' },
  { key: 'vendido', label: 'Vendido', color: 'bg-green-900', text: 'text-green-400', border: 'border-green-800' },
  { key: 'perdido', label: 'Perdido', color: 'bg-red-900', text: 'text-red-400', border: 'border-red-800' },
]

export default function EmbudoPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [etapaSeleccionada, setEtapaSeleccionada] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('clientes').select('*').eq('user_id', user.id)
      setClientes(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const total = clientes.length || 1
  const clientesFiltrados = etapaSeleccionada ? clientes.filter(c => c.estado === etapaSeleccionada) : []

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">📊 Embudo de Ventas</h1>
        <p className="text-gray-400 text-sm mt-1">{clientes.length} clientes en total</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {ETAPAS.map((etapa, i) => {
          const cantidad = clientes.filter(c => c.estado === etapa.key).length
          const porcentaje = Math.round((cantidad / total) * 100)
          const montoTotal = clientes
            .filter(c => c.estado === etapa.key)
            .reduce((sum, c) => sum + (Number(c.monto_estimado) || 0), 0)
          const seleccionada = etapaSeleccionada === etapa.key

          return (
            <div key={etapa.key}>
              <button
                onClick={() => setEtapaSeleccionada(seleccionada ? null : etapa.key)}
                className={`w-full bg-gray-900 rounded-2xl p-4 border transition-all ${seleccionada ? etapa.border : 'border-gray-800'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {i < 5 && <span className="text-gray-600 text-xs">{'↓'.repeat(1)}</span>}
                    <span className={`${etapa.text} font-semibold text-sm`}>{etapa.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {montoTotal > 0 && <span className="text-gray-400 text-xs">${montoTotal.toLocaleString()}</span>}
                    <span className={`${etapa.text} font-bold text-lg`}>{cantidad}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`${etapa.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500 text-xs">{porcentaje}% del total</span>
                  {cantidad > 0 && <span className="text-gray-500 text-xs">Tocá para ver →</span>}
                </div>
              </button>

              {seleccionada && clientesFiltrados.length > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {clientesFiltrados.map(c => (
                    <div
                      key={c.id}
                      onClick={() => window.location.href = `/clientes/${c.id}`}
                      className={`bg-gray-900 rounded-xl p-3 border ${etapa.border} flex items-center justify-between cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${etapa.color} flex items-center justify-center ${etapa.text} font-bold`}>
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{c.nombre}</p>
                          <p className="text-gray-400 text-xs">{c.producto || 'Sin producto'}</p>
                        </div>
                      </div>
                      {c.monto_estimado && (
                        <span className="text-gray-400 text-xs">${Number(c.monto_estimado).toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">RESUMEN</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-400 text-xs">Conversión total</p>
              <p className="text-white font-bold text-lg">
                {clientes.length > 0 ? Math.round((clientes.filter(c => c.estado === 'vendido').length / clientes.length) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Monto potencial</p>
              <p className="text-white font-bold text-lg">
                ${clientes.filter(c => c.estado !== 'perdido').reduce((sum, c) => sum + (Number(c.monto_estimado) || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-3">
        {[
          { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
          { emoji: '👥', label: 'Clientes', href: '/clientes' },
          { emoji: '🎯', label: 'Radar', href: '/radar' },
          { emoji: '✨', label: 'IA', href: '/ia' },
        ].map((n, i) => (
          <button key={i} onClick={() => window.location.href = n.href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <span className="text-xl">{n.emoji}</span>
            <span className="text-xs">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
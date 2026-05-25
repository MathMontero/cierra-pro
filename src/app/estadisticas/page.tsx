'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function EstadisticasPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const total = clientes.length
  const vendidos = clientes.filter(c => c.estado === 'vendido').length
  const perdidos = clientes.filter(c => c.estado === 'perdido').length
  const enProceso = clientes.filter(c => !['vendido', 'perdido'].includes(c.estado)).length
  const conversion = total > 0 ? Math.round((vendidos / total) * 100) : 0
  const montoTotal = clientes.filter(c => c.estado === 'vendido').reduce((sum, c) => sum + (Number(c.monto_estimado) || 0), 0)
  const montoPotencial = clientes.filter(c => !['vendido', 'perdido'].includes(c.estado)).reduce((sum, c) => sum + (Number(c.monto_estimado) || 0), 0)

  const porEstado = ['nuevo', 'seguimiento', 'financiera', 'aprobado', 'vendido', 'perdido'].map(e => ({
    estado: e,
    cantidad: clientes.filter(c => c.estado === e).length,
  }))

  const productosMas = Object.entries(
    clientes.reduce((acc: any, c) => {
      if (c.producto) acc[c.producto] = (acc[c.producto] || 0) + 1
      return acc
    }, {})
  ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">📈 Estadísticas</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen de tu actividad</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '👥', label: 'Total clientes', valor: total, color: 'border-gray-800' },
            { emoji: '✅', label: 'Ventas cerradas', valor: vendidos, color: 'border-green-800' },
            { emoji: '⚡', label: 'En proceso', valor: enProceso, color: 'border-blue-800' },
            { emoji: '❌', label: 'Perdidos', valor: perdidos, color: 'border-red-800' },
          ].map((m, i) => (
            <div key={i} className={`bg-gray-900 rounded-2xl p-4 border ${m.color}`}>
              <p className="text-2xl mb-1">{m.emoji}</p>
              <p className="text-xs text-gray-400 mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-white">{m.valor}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-900/20 rounded-2xl p-4 border border-green-800">
            <p className="text-xs text-gray-400 mb-1">Monto vendido</p>
            <p className="text-lg font-bold text-green-400">${montoTotal.toLocaleString()}</p>
          </div>
          <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-800">
            <p className="text-xs text-gray-400 mb-1">Monto potencial</p>
            <p className="text-lg font-bold text-blue-400">${montoPotencial.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">TASA DE CONVERSIÓN</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-gray-800 rounded-full h-4">
              <div className="bg-green-600 h-4 rounded-full transition-all duration-700" style={{ width: `${conversion}%` }}/>
            </div>
            <span className="text-white font-bold text-lg">{conversion}%</span>
          </div>
          <p className="text-gray-500 text-xs">{vendidos} vendidos de {total} totales</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">CLIENTES POR ESTADO</p>
          <div className="space-y-2">
            {porEstado.map(e => (
              <div key={e.estado} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-24">{e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: total > 0 ? `${(e.cantidad / total) * 100}%` : '0%' }}/>
                </div>
                <span className="text-white text-xs font-bold w-4 text-right">{e.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        {productosMas.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-3">PRODUCTOS MÁS CONSULTADOS</p>
            <div className="space-y-2">
              {productosMas.map(([producto, cantidad]: any) => (
                <div key={producto} className="flex items-center justify-between">
                  <span className="text-white text-sm">{producto}</span>
                  <span className="text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded-lg">{cantidad}</span>
                </div>
              ))}
            </div>
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
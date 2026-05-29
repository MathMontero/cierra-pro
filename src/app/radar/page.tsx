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

export default function RadarPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const hoy = new Date()
      const en90dias = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000)
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'vendido')
        .not('fecha_fin_credito', 'is', null)
        .lte('fecha_fin_credito', en90dias.toISOString().split('T')[0])
        .gte('fecha_fin_credito', hoy.toISOString().split('T')[0])
        .order('fecha_fin_credito', { ascending: true })
      setClientes(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const clasificar = (fechaFin: string) => {
    const dias = Math.ceil((new Date(fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (dias <= 30) return { color: 'bg-green-900 text-green-400', emoji: '🟢', dias, probabilidad: 85 }
    if (dias <= 60) return { color: 'bg-yellow-900 text-yellow-400', emoji: '🟡', dias, probabilidad: 60 }
    return { color: 'bg-gray-800 text-gray-400', emoji: '⚪', dias, probabilidad: 35 }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const verdes = clientes.filter(c => clasificar(c.fecha_fin_credito).dias <= 30)
  const amarillos = clientes.filter(c => clasificar(c.fecha_fin_credito).dias > 30 && clasificar(c.fecha_fin_credito).dias <= 60)
  const grises = clientes.filter(c => clasificar(c.fecha_fin_credito).dias > 60)

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">🎯 Radar de Oportunidades</h1>
        <p className="text-gray-400 text-sm mt-1">Clientes que terminan crédito pronto</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {clientes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-white font-medium">Sin oportunidades por ahora</p>
            <p className="text-gray-400 text-sm mt-1">Aparecen clientes vendidos con fecha de fin de crédito</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '🟢', label: 'Próximos', valor: verdes.length, color: 'bg-green-900/30' },
                { emoji: '🟡', label: 'Atentos', valor: amarillos.length, color: 'bg-yellow-900/30' },
                { emoji: '⚪', label: 'Futuros', valor: grises.length, color: 'bg-gray-800' },
              ].map((m, i) => (
                <div key={i} className={`${m.color} rounded-2xl p-3 text-center border border-gray-800`}>
                  <p className="text-xl mb-1">{m.emoji}</p>
                  <p className="text-white font-bold text-lg">{m.valor}</p>
                  <p className="text-gray-400 text-xs">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {clientes.map(c => {
                const info = clasificar(c.fecha_fin_credito)
                return (
                  <div key={c.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">{c.nombre.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="text-white font-medium">{c.nombre}</p>
                          <p className="text-gray-400 text-xs">{c.producto || 'Sin producto'}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${info.color}`}>{info.emoji} {info.dias}d</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                      {c.financiera_usada && <span>🏦 {c.financiera_usada}</span>}
                      {c.cantidad_cuotas && <span>📅 {c.cantidad_cuotas} cuotas</span>}
                      {c.fecha_fin_credito && <span>📆 Fin: {c.fecha_fin_credito}</span>}
                      <span>🎯 {info.probabilidad}% prob.</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {c.telefono && <a href={`https://wa.me/${c.telefono}`} target="_blank" rel="noopener noreferrer" className="bg-green-900 text-green-400 text-xs font-medium py-2 rounded-xl text-center">💬 WhatsApp</a>}
                      <button onClick={() => window.location.href = `/clientes/${c.id}`} className="bg-gray-800 text-gray-300 text-xs font-medium py-2 rounded-xl">Ver historial</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
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
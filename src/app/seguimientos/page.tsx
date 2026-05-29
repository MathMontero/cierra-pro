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

export default function SeguimientosPage() {
  const [seguimientos, setSeguimientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('seguimientos')
        .select('*, clientes(nombre, telefono)')
        .eq('completado', false)
        .lte('fecha', hoy + 'T23:59:59')
        .order('fecha', { ascending: true })
      setSeguimientos(data || [])
      setLoading(false)
    }
    cargar()
  }, [])

  const completar = async (id: string) => {
    await supabase.from('seguimientos').update({ completado: true }).eq('id', id)
    setSeguimientos(prev => prev.filter(s => s.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">⏰ Seguimientos</h1>
        <p className="text-gray-400 text-sm mt-1">{seguimientos.length} pendientes hoy</p>
      </div>

      <div className="px-4 py-4">
        {seguimientos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-medium">Todo al día</p>
            <p className="text-gray-400 text-sm mt-1">No tenés seguimientos pendientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {seguimientos.map(s => (
              <div key={s.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{s.clientes?.nombre}</p>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">{s.tipo}</span>
                </div>
                {s.observaciones && <p className="text-gray-400 text-sm mb-3">{s.observaciones}</p>}
                <div className="flex gap-2">
                  {s.clientes?.telefono && (
                    <a href={`https://wa.me/${s.clientes.telefono}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-900 text-green-400 text-xs font-medium py-2 rounded-xl text-center">💬 WhatsApp</a>
                  )}
                  <button onClick={() => completar(s.id)} className="flex-1 bg-blue-600 text-white text-xs font-medium py-2 rounded-xl">✅ Completado</button>
                </div>
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
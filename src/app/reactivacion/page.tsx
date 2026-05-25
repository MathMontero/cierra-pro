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

const PERIODOS = [
  { dias: 15, label: '15 días', color: 'bg-red-900/30 border-red-800 text-red-400' },
  { dias: 30, label: '30 días', color: 'bg-orange-900/30 border-orange-800 text-orange-400' },
  { dias: 60, label: '60 días', color: 'bg-yellow-900/30 border-yellow-800 text-yellow-400' },
  { dias: 90, label: '90 días', color: 'bg-gray-800 border-gray-700 text-gray-400' },
]

export default function ReactivacionPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState(30)
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - periodo)
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .not('estado', 'eq', 'vendido')
        .not('estado', 'eq', 'perdido')
        .lt('updated_at', fecha.toISOString())
        .order('updated_at', { ascending: true })
      setClientes(data || [])
      setLoading(false)
    }
    cargar()
  }, [periodo])

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const seleccionarTodos = () => {
    if (seleccionados.length === clientes.length) setSeleccionados([])
    else setSeleccionados(clientes.map(c => c.id))
  }

  const diasInactivo = (fecha: string) => {
    return Math.floor((new Date().getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24))
  }

  const mensajeWhatsApp = (nombre: string) => {
    return encodeURIComponent(`Hola ${nombre}! Te escribo porque hace un tiempo estuviste consultando con nosotros. Tenes novedades que te pueden interesar. Avisame!`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )
  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">♻️ Reactivación</h1>
        <p className="text-gray-400 text-sm mt-1">Clientes sin contacto hace tiempo</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {PERIODOS.map(p => (
            <button key={p.dias} onClick={() => { setPeriodo(p.dias); setSeleccionados([]) }} className={`py-2 rounded-xl text-xs font-medium border transition-colors ${periodo === p.dias ? p.color : 'bg-gray-900 border-gray-800 text-gray-400'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {clientes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-medium">Sin clientes inactivos</p>
            <p className="text-gray-400 text-sm mt-1">No hay clientes sin contacto hace {periodo} días</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{clientes.length} clientes encontrados</p>
              <button onClick={seleccionarTodos} className="text-blue-400 text-sm">
                {seleccionados.length === clientes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            {seleccionados.length > 0 && (
              <div className="bg-blue-950 rounded-2xl p-3 border border-blue-800 flex items-center justify-between">
                <p className="text-blue-400 text-sm">{seleccionados.length} seleccionados</p>
                <button
                  onClick={() => {
                    clientes.filter(c => seleccionados.includes(c.id)).forEach(c => {
                      if (c.telefono) window.open(`https://wa.me/${c.telefono}?text=${mensajeWhatsApp(c.nombre)}`, '_blank')
                    })
                  }}
                  className="bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  💬 Contactar todos
                </button>
              </div>
            )}

            <div className="space-y-2">
              {clientes.map(c => (
                <div key={c.id} className={`bg-gray-900 rounded-xl p-3 border transition-all ${seleccionados.includes(c.id) ? 'border-blue-500' : 'border-gray-800'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSeleccion(c.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${seleccionados.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>
                      {seleccionados.includes(c.id) && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1 cursor-pointer" onClick={() => window.location.href = `/clientes/${c.id}`}>
                      <p className="text-white font-medium text-sm">{c.nombre}</p>
                      <p className="text-gray-400 text-xs">{c.producto || 'Sin producto'} · {diasInactivo(c.updated_at)} días sin contacto</p>
                    </div>
                    {c.telefono && (
                      <a href={`https://wa.me/${c.telefono}?text=${mensajeWhatsApp(c.nombre)}`} target="_blank" className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center text-green-400 text-sm flex-shrink-0">
                        💬
                      </a>
                    )}
                  </div>
                </div>
              ))}
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
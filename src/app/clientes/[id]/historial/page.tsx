'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function HistorialPage({ params }: { params: { id: string } }) {
  const [cliente, setCliente] = useState<any>(null)
  const [seguimientos, setSeguimientos] = useState<any[]>([])
  const [mensajes, setMensajes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const [{ data: cli }, { data: segs }, { data: msgs }] = await Promise.all([
        supabase.from('clientes').select('*').eq('id', params.id).single(),
        supabase.from('seguimientos').select('*').eq('cliente_id', params.id).order('fecha', { ascending: false }),
        supabase.from('mensajes_generados').select('*').eq('cliente_id', params.id).order('fecha', { ascending: false }),
      ])
      setCliente(cli)
      setSeguimientos(segs || [])
      setMensajes(msgs || [])
      setLoading(false)
    }
    cargar()
  }, [params.id])

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const timeline = [
    ...seguimientos.map(s => ({
      id: s.id,
      tipo: 'seguimiento',
      fecha: s.fecha,
      titulo: s.tipo.charAt(0).toUpperCase() + s.tipo.slice(1),
      descripcion: s.observaciones,
      completado: s.completado,
      emoji: s.tipo === 'whatsapp' ? '💬' : s.tipo === 'llamada' ? '📞' : s.tipo === 'presencial' ? '🤝' : '🏦',
    })),
    ...mensajes.map(m => ({
      id: m.id,
      tipo: 'mensaje',
      fecha: m.fecha,
      titulo: 'Mensaje generado',
      descripcion: m.mensaje?.slice(0, 80) + '...',
      completado: m.enviado,
      emoji: '✉️',
    })),
    {
      id: 'creacion',
      tipo: 'creacion',
      fecha: cliente?.created_at,
      titulo: 'Cliente creado',
      descripcion: `Estado inicial: ${cliente?.estado}`,
      completado: true,
      emoji: '⭐',
    }
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => window.location.href = `/clientes/${params.id}`} className="text-gray-400 hover:text-white text-xl">←</button>
        <div>
          <h1 className="text-xl font-bold text-white">Historial</h1>
          <p className="text-gray-400 text-xs">{cliente?.nombre}</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white font-medium">Sin actividad todavía</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800"/>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={item.id} className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10 ${
                    item.tipo === 'creacion' ? 'bg-blue-900' :
                    item.completado ? 'bg-green-900' : 'bg-gray-800'
                  }`}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-2xl p-3 border border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium text-sm">{item.titulo}</p>
                      {item.tipo === 'seguimiento' && (
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${item.completado ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                          {item.completado ? 'Completado' : 'Pendiente'}
                        </span>
                      )}
                    </div>
                    {item.descripcion && <p className="text-gray-400 text-xs mb-1">{item.descripcion}</p>}
                    <p className="text-gray-600 text-xs">{formatFecha(item.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const ESTADOS = ['nuevo', 'seguimiento', 'financiera', 'aprobado', 'vendido', 'perdido']
const TIPOS_SEGUIMIENTO = ['whatsapp', 'llamada', 'presencial', 'financiera']
const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function ClienteDetallePage({ params }: { params: { id: string } }) {
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(false)
  const [nuevoSeg, setNuevoSeg] = useState({ tipo: 'whatsapp', observaciones: '', fecha: new Date().toISOString().slice(0, 16) })

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('clientes').select('*').eq('id', params.id).single()
      setCliente(data)
      setLoading(false)
    }
    cargar()
  }, [params.id])

  const actualizarEstado = async (nuevoEstado: string) => {
    setGuardando(true)
    await supabase.from('clientes').update({ estado: nuevoEstado }).eq('id', params.id)
    setCliente((p: any) => ({ ...p, estado: nuevoEstado }))
    setGuardando(false)
  }

  const guardarSeguimiento = async () => {
    setGuardando(true)
    await supabase.from('seguimientos').insert({
      cliente_id: params.id,
      tipo: nuevoSeg.tipo,
      observaciones: nuevoSeg.observaciones,
      fecha: nuevoSeg.fecha,
      completado: false,
    })
    setMostrarSeguimiento(false)
    setNuevoSeg({ tipo: 'whatsapp', observaciones: '', fecha: new Date().toISOString().slice(0, 16) })
    setGuardando(false)
    alert('Seguimiento guardado')
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clientes').delete().eq('id', params.id)
    window.location.href = '/clientes'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  if (!cliente) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cliente no encontrado</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => window.location.href = '/clientes'} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white flex-1">{cliente.nombre}</h1>
        <button onClick={() => window.location.href = `/clientes/${params.id}/editar`} className="text-blue-400 text-sm hover:text-blue-300 mr-2">Editar</button>
        <button onClick={eliminar} className="text-red-400 text-sm hover:text-red-300">Eliminar</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-2xl">
            {cliente.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{cliente.nombre}</h2>
            {cliente.telefono && <p className="text-gray-400 text-sm">{cliente.telefono}</p>}
            {cliente.producto && <p className="text-gray-400 text-sm">{cliente.producto}</p>}
          </div>
        </div>

        {cliente.telefono && (
          <div className="grid grid-cols-2 gap-3">
            <a href={`https://wa.me/${cliente.telefono}`} className="bg-green-900 hover:bg-green-800 text-green-400 font-semibold py-3 rounded-2xl text-center">💬 WhatsApp</a>
            <a href={`tel:${cliente.telefono}`} className="bg-blue-900 hover:bg-blue-800 text-blue-400 font-semibold py-3 rounded-2xl text-center">📞 Llamar</a>
          </div>
        )}

        <button onClick={() => setMostrarSeguimiento(!mostrarSeguimiento)} className="w-full bg-purple-900 hover:bg-purple-800 text-purple-300 font-semibold py-3 rounded-2xl transition-colors">
          ⏰ Agendar seguimiento
        </button>
        <button
          onClick={() => window.location.href = `/clientes/${params.id}/historial`}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-2xl transition-colors"
        >
          📋 Ver historial completo
        </button>

        {mostrarSeguimiento && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-purple-800 space-y-3">
            <p className="text-purple-400 text-xs font-semibold">NUEVO SEGUIMIENTO</p>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_SEGUIMIENTO.map(t => (
                <button key={t} onClick={() => setNuevoSeg(p => ({ ...p, tipo: t }))} className={`py-2 rounded-xl text-xs font-medium transition-colors ${nuevoSeg.tipo === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <input type="datetime-local" value={nuevoSeg.fecha} onChange={e => setNuevoSeg(p => ({ ...p, fecha: e.target.value }))} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500" />
            <textarea placeholder="Observaciones..." value={nuevoSeg.observaciones} onChange={e => setNuevoSeg(p => ({ ...p, observaciones: e.target.value }))} rows={2} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            <button onClick={guardarSeguimiento} disabled={guardando} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl">
              {guardando ? 'Guardando...' : '✅ Guardar seguimiento'}
            </button>
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">ESTADO</p>
          <div className="grid grid-cols-3 gap-2">
            {ESTADOS.map(e => (
              <button key={e} onClick={() => actualizarEstado(e)} disabled={guardando} className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors ${cliente.estado === e ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">DETALLES</p>
          {[
            { label: 'DNI', valor: cliente.dni },
            { label: 'Producto', valor: cliente.producto },
            { label: 'Marca', valor: cliente.marca },
            { label: 'Modelo', valor: cliente.modelo },
            { label: 'Monto estimado', valor: cliente.monto_estimado ? `$${Number(cliente.monto_estimado).toLocaleString()}` : null },
            { label: 'Financiera', valor: cliente.financiera_usada },
            { label: 'Cuotas', valor: cliente.cantidad_cuotas },
            { label: 'Fecha consulta', valor: cliente.fecha_consulta },
            { label: 'Observaciones', valor: cliente.observaciones },
          ].filter(d => d.valor).map((d, i) => (
            <div key={i} className="flex justify-between items-start">
              <span className="text-gray-400 text-sm">{d.label}</span>
              <span className="text-white text-sm text-right max-w-48">{String(d.valor)}</span>
            </div>
          ))}
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
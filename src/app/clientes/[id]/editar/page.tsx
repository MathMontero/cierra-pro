'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const [datos, setDatos] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from('clientes').select('*').eq('id', params.id).single()
      setDatos(data || {})
      setLoading(false)
    }
    cargar()
  }, [params.id])

  const guardar = async () => {
    setGuardando(true)
    const { error } = await supabase.from('clientes').update({
      nombre: datos.nombre,
      telefono: datos.telefono,
      producto: datos.producto,
      marca: datos.marca,
      modelo: datos.modelo,
      monto_estimado: datos.monto_estimado,
      financiera_usada: datos.financiera_usada,
      cantidad_cuotas: datos.cantidad_cuotas,
      valor_cuota: datos.valor_cuota,
      fecha_compra: datos.fecha_compra,
      observaciones: datos.observaciones,
      prioridad: datos.prioridad,
    }).eq('id', params.id)
    if (error) alert('Error: ' + error.message)
    else window.location.href = `/clientes/${params.id}`
    setGuardando(false)
  }

  const campo = (label: string, key: string, tipo: string = 'text') => (
    <div>
      <label className="text-gray-400 text-xs font-medium block mb-1">{label}</label>
      <input
        type={tipo}
        value={datos[key] || ''}
        onChange={e => setDatos((p: any) => ({ ...p, [key]: e.target.value }))}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
      />
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => window.location.href = `/clientes/${params.id}`} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white">Editar Cliente</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">DATOS PERSONALES</p>
          {campo('Nombre *', 'nombre')}
          {campo('Teléfono', 'telefono')}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">PRODUCTO</p>
          {campo('Producto', 'producto')}
          {campo('Marca', 'marca')}
          {campo('Modelo', 'modelo')}
          {campo('Monto estimado', 'monto_estimado', 'number')}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">FINANCIERA</p>
          {campo('Financiera', 'financiera_usada')}
          {campo('Cantidad cuotas', 'cantidad_cuotas', 'number')}
          {campo('Valor cuota', 'valor_cuota', 'number')}
          {campo('Fecha compra', 'fecha_compra', 'date')}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">PRIORIDAD</p>
          <div className="grid grid-cols-3 gap-2">
            {['alta', 'media', 'baja'].map(p => (
              <button
                key={p}
                onClick={() => setDatos((prev: any) => ({ ...prev, prioridad: p }))}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  datos.prioridad === p
                    ? p === 'alta' ? 'bg-red-600 text-white'
                    : p === 'media' ? 'bg-yellow-600 text-white'
                    : 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">OBSERVACIONES</p>
          <textarea
            value={datos.observaciones || ''}
            onChange={e => setDatos((p: any) => ({ ...p, observaciones: e.target.value }))}
            rows={4}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 resize-none"
          />
        </div>

        <button
          onClick={guardar}
          disabled={!datos.nombre || guardando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-colors"
        >
          {guardando ? '⏳ Guardando...' : '✅ Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
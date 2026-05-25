'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Modo = 'voz' | 'texto' | 'pegar' | null

export default function NuevoClientePage() {
  const [modo, setModo] = useState<Modo>(null)
  const [texto, setTexto] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [datos, setDatos] = useState<any>({})

  const analizarConIA = async (input: string) => {
    setProcesando(true)
    try {
      const res = await fetch('/api/ia/parsear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: input }),
      })
      const json = await res.json()
      setDatos(json.cliente || {})
    } catch {
      alert('Error al analizar con IA')
    }
    setProcesando(false)
  }

  const guardarCliente = async () => {
    if (!datos.nombre) return
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clientes').insert({
      ...datos,
      user_id: user!.id,
      estado: 'nuevo',
      prioridad: 'media',
      fecha_consulta: new Date().toISOString().split('T')[0],
    })
    if (error) alert('Error al guardar: ' + error.message)
    else window.location.href = '/dashboard'
    setGuardando(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => window.location.href = '/dashboard'} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white">Nuevo Cliente</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {!modo && (
          <>
            <p className="text-gray-400 text-center text-sm mb-6">¿Cómo querés agregar el cliente?</p>
            <div className="space-y-3">
              {[
                { id: 'texto', emoji: '✏️', label: 'Escribir', sub: 'Completá los datos manualmente' },
                { id: 'pegar', emoji: '📋', label: 'Pegar conversación', sub: 'La IA detecta los datos automáticamente' },
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => setModo(op.id as Modo)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500 transition-all text-left"
                >
                  <span className="text-3xl">{op.emoji}</span>
                  <div>
                    <p className="text-white font-medium">{op.label}</p>
                    <p className="text-gray-400 text-sm">{op.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {modo === 'texto' && (
          <div className="space-y-3">
            <input
              placeholder="Nombre del cliente *"
              value={datos.nombre || ''}
              onChange={e => setDatos((p: any) => ({ ...p, nombre: e.target.value }))}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
            />
            <input
              placeholder="Teléfono"
              value={datos.telefono || ''}
              onChange={e => setDatos((p: any) => ({ ...p, telefono: e.target.value }))}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
            />
            <input
              placeholder="Producto que busca"
              value={datos.producto || ''}
              onChange={e => setDatos((p: any) => ({ ...p, producto: e.target.value }))}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
            />
            <input
              placeholder="Monto estimado"
              type="number"
              value={datos.monto_estimado || ''}
              onChange={e => setDatos((p: any) => ({ ...p, monto_estimado: e.target.value }))}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
            />
            <textarea
              placeholder="Observaciones"
              value={datos.observaciones || ''}
              onChange={e => setDatos((p: any) => ({ ...p, observaciones: e.target.value }))}
              rows={3}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 resize-none"
            />
          </div>
        )}

        {modo === 'pegar' && (
          <div className="space-y-3">
            <textarea
              placeholder="Pegá la conversación de WhatsApp o Messenger acá..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={6}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 resize-none"
            />
            <button
              onClick={() => analizarConIA(texto)}
              disabled={!texto || procesando}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {procesando ? '⚙️ Analizando con IA...' : '✨ Analizar con IA'}
            </button>
          </div>
        )}

        {datos.nombre && (
          <div className="bg-blue-950 border border-blue-800 rounded-2xl p-4 space-y-2">
            <p className="text-blue-400 text-xs font-semibold">DATOS DETECTADOS</p>
            {datos.nombre && <p className="text-white text-sm">👤 <span className="text-gray-400">Nombre:</span> {datos.nombre}</p>}
            {datos.telefono && <p className="text-white text-sm">📞 <span className="text-gray-400">Tel:</span> {datos.telefono}</p>}
            {datos.producto && <p className="text-white text-sm">📦 <span className="text-gray-400">Producto:</span> {datos.producto}</p>}
            {datos.monto_estimado && <p className="text-white text-sm">💰 <span className="text-gray-400">Monto:</span> ${datos.monto_estimado}</p>}
            {datos.observaciones && <p className="text-white text-sm">📝 <span className="text-gray-400">Nota:</span> {datos.observaciones}</p>}
          </div>
        )}

        {modo && (
          <div className="space-y-3 pt-2">
            <button
              onClick={guardarCliente}
              disabled={!datos.nombre || guardando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              {guardando ? '⏳ Guardando...' : '✅ Guardar Cliente'}
            </button>
            <button
              onClick={() => { setModo(null); setDatos({}); setTexto('') }}
              className="w-full bg-gray-900 text-gray-400 font-medium py-3 rounded-2xl border border-gray-800"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
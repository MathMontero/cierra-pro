'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function IAPage() {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<any>(null)
  const [procesando, setProcesando] = useState(false)
  const [tab, setTab] = useState<'parsear' | 'mensaje'>('parsear')
  const [tipoMensaje, setTipoMensaje] = useState('reactivacion')
  const [mensajeGenerado, setMensajeGenerado] = useState('')

  const parsearTexto = async () => {
    if (!texto) return
    setProcesando(true)
    try {
      const res = await fetch('/api/ia/parsear', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto }) })
      const json = await res.json()
      setResultado(json.cliente)
    } catch { alert('Error al procesar') }
    setProcesando(false)
  }

  const guardarCliente = async () => {
    if (!resultado?.nombre) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clientes').insert({ ...resultado, user_id: user!.id, estado: 'nuevo', prioridad: 'media', fecha_consulta: new Date().toISOString().split('T')[0] })
    if (!error) { alert('Cliente guardado'); setTexto(''); setResultado(null) }
  }

  const generarMensaje = async () => {
    if (!texto) return
    setProcesando(true)
    try {
      const res = await fetch('/api/ia/mensaje', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: texto, tipo: tipoMensaje }) })
      const json = await res.json()
      setMensajeGenerado(json.mensaje)
    } catch { alert('Error al generar') }
    setProcesando(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">✨ Asistente IA</h1>
        <p className="text-gray-400 text-sm mt-1">Herramientas inteligentes de ventas</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          {[{ id: 'parsear', label: '📋 Detectar cliente' }, { id: 'mensaje', label: '💬 Generar mensaje' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'parsear' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Pegá una conversación y la IA detecta los datos del cliente.</p>
            <textarea placeholder="Pegá la conversación acá..." value={texto} onChange={e => setTexto(e.target.value)} rows={5} className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800 resize-none" />
            <button onClick={parsearTexto} disabled={!texto || procesando} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl">
              {procesando ? '⚙️ Analizando...' : '✨ Analizar con IA'}
            </button>
            {resultado && (
              <div className="bg-blue-950 border border-blue-800 rounded-2xl p-4 space-y-2">
                <p className="text-blue-400 text-xs font-semibold">DATOS DETECTADOS</p>
                {resultado.nombre && <p className="text-white text-sm">👤 {resultado.nombre}</p>}
                {resultado.telefono && <p className="text-white text-sm">📞 {resultado.telefono}</p>}
                {resultado.producto && <p className="text-white text-sm">📦 {resultado.producto}</p>}
                {resultado.monto_estimado && <p className="text-white text-sm">💰 ${resultado.monto_estimado}</p>}
                <button onClick={guardarCliente} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-2">✅ Guardar como cliente</button>
              </div>
            )}
          </div>
        )}

        {tab === 'mensaje' && (
          <div className="space-y-3">
            <input placeholder="Nombre del cliente" value={texto} onChange={e => setTexto(e.target.value)} className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800" />
            <div className="grid grid-cols-2 gap-2">
              {['reactivacion', 'renovacion', 'seguimiento', 'oferta'].map(t => (
                <button key={t} onClick={() => setTipoMensaje(t)} className={`py-2 rounded-xl text-xs font-medium ${tipoMensaje === t ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={generarMensaje} disabled={!texto || procesando} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl">
              {procesando ? '⚙️ Generando...' : '✨ Generar mensaje'}
            </button>
            {mensajeGenerado && (
              <div className="bg-green-950 border border-green-800 rounded-2xl p-4 space-y-3">
                <p className="text-green-400 text-xs font-semibold">MENSAJE GENERADO</p>
                <p className="text-white text-sm whitespace-pre-wrap">{mensajeGenerado}</p>
                <button onClick={() => navigator.clipboard.writeText(mensajeGenerado).then(() => alert('Copiado'))} className="w-full bg-green-800 text-green-300 font-semibold py-2 rounded-xl text-sm">📋 Copiar mensaje</button>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-2">ESTADO IA</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <p className="text-gray-300 text-sm">Pendiente crédito OpenAI</p>
          </div>
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
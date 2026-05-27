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

export default function BuscarPage() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)

  const buscar = async (texto: string) => {
    setQuery(texto)
    if (texto.length < 2) { setResultados([]); return }
    setBuscando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .or(`nombre.ilike.%${texto}%,telefono.ilike.%${texto}%,producto.ilike.%${texto}%,observaciones.ilike.%${texto}%,dni.ilike.%${texto}%`)
      .limit(20)

    setResultados(data || [])
    setBuscando(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white mb-3">🔍 Búsqueda global</h1>
        <input
          autoFocus
          placeholder="Nombre, teléfono, producto, DNI..."
          value={query}
          onChange={e => buscar(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="px-4 py-4">
        {query.length < 2 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 text-sm">Escribí al menos 2 caracteres</p>
          </div>
        ) : buscando ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Buscando...</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">😕</p>
            <p className="text-white font-medium">Sin resultados</p>
            <p className="text-gray-400 text-sm mt-1">Probá con otro término</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-400 text-xs mb-3">{resultados.length} resultados</p>
            {resultados.map(c => (
              <div
                key={c.id}
                onClick={() => window.location.href = `/clientes/${c.id}`}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{c.nombre}</p>
                    <p className="text-gray-400 text-xs">
                      {c.telefono && `📞 ${c.telefono} · `}
                      {c.producto || 'Sin producto'}
                      {c.dni && ` · DNI: ${c.dni}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  c.estado === 'vendido' ? 'bg-green-900 text-green-400' :
                  c.estado === 'perdido' ? 'bg-red-900 text-red-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {c.estado}
                </span>
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
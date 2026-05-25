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

const RUBROS = [
  { id: 'motos', emoji: '🏍', label: 'Motos' },
  { id: 'electro', emoji: '📺', label: 'Electrodomésticos' },
  { id: 'ropa', emoji: '👕', label: 'Ropa y calzado' },
  { id: 'pinturas', emoji: '🎨', label: 'Pinturas' },
  { id: 'hogar', emoji: '🛋', label: 'Art. del hogar' },
  { id: 'perfumes', emoji: '🌸', label: 'Perfumes' },
  { id: 'tecnologia', emoji: '💻', label: 'Tecnología' },
  { id: 'autos', emoji: '🚗', label: 'Autos' },
  { id: 'muebles', emoji: '🪑', label: 'Muebles' },
  { id: 'deportes', emoji: '⚽', label: 'Deportes' },
  { id: 'otro', emoji: '🏪', label: 'Otro rubro' },
]

export default function ConfiguracionPage() {
  const [datos, setDatos] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [rubros, setRubros] = useState<string[]>([])

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setDatos(data)
        setRubros(data.modo_uso ? data.modo_uso.split(',') : [])
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const toggleRubro = (id: string) => {
    setRubros(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const guardar = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('users').update({
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono,
      modo_uso: rubros.join(','),
    }).eq('id', user!.id)
    if (error) alert('Error: ' + error.message)
    else alert('Guardado correctamente')
    setGuardando(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">⚙️ Configuración</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <p className="text-gray-400 text-xs font-semibold">MI PERFIL</p>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Nombre</label>
            <input value={datos.nombre || ''} onChange={e => setDatos((p: any) => ({ ...p, nombre: e.target.value }))} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Apellido</label>
            <input value={datos.apellido || ''} onChange={e => setDatos((p: any) => ({ ...p, apellido: e.target.value }))} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Teléfono</label>
            <input value={datos.telefono || ''} onChange={e => setDatos((p: any) => ({ ...p, telefono: e.target.value }))} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Email</label>
            <input value={datos.email || ''} disabled className="w-full bg-gray-800 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-xs font-semibold mb-3">RUBROS</p>
          <div className="grid grid-cols-2 gap-2">
            {RUBROS.map(r => (
              <button key={r.id} onClick={() => toggleRubro(r.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-colors ${rubros.includes(r.id) ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-700 bg-gray-800 text-gray-400'}`}>
                <span>{r.emoji}</span>
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={guardar} disabled={guardando} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-colors">
          {guardando ? '⏳ Guardando...' : '✅ Guardar cambios'}
        </button>

        <button
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
          className="w-full bg-red-900 hover:bg-red-800 text-red-400 font-semibold py-4 rounded-2xl transition-colors"
        >
          Cerrar sesión
        </button>
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
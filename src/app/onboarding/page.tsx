'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

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

export default function OnboardingPage() {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [rubrosSeleccionados, setRubros] = useState<string[]>([])
  const [otroRubro, setOtroRubro] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleRubro = (id: string) => {
    setRubros(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const handleContinuar = async () => {
    if (rubrosSeleccionados.length === 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const rubroFinal = rubrosSeleccionados.includes('otro') && otroRubro
      ? [...rubrosSeleccionados.filter(r => r !== 'otro'), otroRubro]
      : rubrosSeleccionados

    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      nombre,
      apellido,
      modo_uso: rubroFinal.join(','),
      onboarding_ok: true,
    })

    window.location.href = '/dashboard'
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {paso === 1 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">Hola! ¿Cómo te llamás?</h1>
              <p className="text-gray-400 mt-2">Paso 1 de 2</p>
            </div>
            <div className="space-y-3 mb-6">
              <input
                placeholder="Nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
              />
              <input
                placeholder="Apellido"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-800"
              />
            </div>
            <button
              onClick={() => setPaso(2)}
              disabled={!nombre}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              Continuar →
            </button>
          </>
        )}

        {paso === 2 && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">¿Qué vendés?</h1>
              <p className="text-gray-400 mt-2">Paso 2 de 2 · Podés elegir más de uno</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {RUBROS.map(op => (
                <button
                  key={op.id}
                  onClick={() => toggleRubro(op.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                    rubrosSeleccionados.includes(op.id)
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-gray-800 bg-gray-900 text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{op.emoji}</span>
                  <span className="text-xs font-medium">{op.label}</span>
                </button>
              ))}
            </div>
            {rubrosSeleccionados.includes('otro') && (
              <input
                type="text"
                placeholder="¿Cuál es tu rubro?"
                value={otroRubro}
                onChange={e => setOtroRubro(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaso(1)}
                className="py-4 bg-gray-900 text-gray-400 rounded-2xl border border-gray-800"
              >
                ← Atrás
              </button>
              <button
                onClick={handleContinuar}
                disabled={rubrosSeleccionados.length === 0 || loading}
                className="py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-2xl transition-colors"
              >
                {loading ? 'Guardando...' : `Continuar (${rubrosSeleccionados.length}) →`}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function UnirsePage() {
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const unirse = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      if (!token) { setEstado('error'); setMensaje('Link inválido'); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/login?redirect=/unirse?token=${token}`
        return
      }

      const { data: inv } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('token', token)
        .eq('usado', false)
        .single()

      if (!inv) { setEstado('error'); setMensaje('Link inválido o ya usado'); return }

      await supabase.from('users').update({
        empresa_id: inv.empresa_id,
        rol: 'vendedor'
      }).eq('id', user.id)

      await supabase.from('invitaciones').update({ usado: true }).eq('id', inv.id)

      setEstado('ok')
      setMensaje('Te uniste al equipo correctamente')
      setTimeout(() => window.location.href = '/dashboard', 2000)
    }
    unirse()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center max-w-sm w-full">
        {estado === 'cargando' && <p className="text-gray-400">Procesando invitación...</p>}
        {estado === 'ok' && (
          <>
            <p className="text-4xl mb-3">✅</p>
            <p className="text-white font-bold text-lg">{mensaje}</p>
            <p className="text-gray-400 text-sm mt-2">Redirigiendo al dashboard...</p>
          </>
        )}
        {estado === 'error' && (
          <>
            <p className="text-4xl mb-3">❌</p>
            <p className="text-white font-bold text-lg">{mensaje}</p>
            <button onClick={() => window.location.href = '/dashboard'} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm">
              Ir al dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
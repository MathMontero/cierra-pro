'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [vendedores, setVendedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [emailInvitar, setEmailInvitar] = useState('')
  const [creando, setCreando] = useState(false)
  const [invitando, setInvitando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: perfil } = await supabase
        .from('users')
        .select('*, empresas(*)')
        .eq('id', user.id)
        .single()

      if (perfil?.empresa_id) {
        const { data: emp } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', perfil.empresa_id)
          .single()
        setEmpresa(emp)

        const { data: vends } = await supabase
          .from('users')
          .select('*')
          .eq('empresa_id', perfil.empresa_id)
        setVendedores(vends || [])
      }

      setLoading(false)
    }
    cargar()
  }, [])

  const crearEmpresa = async () => {
    if (!nombreEmpresa) return
    setCreando(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: emp, error } = await supabase
      .from('empresas')
      .insert({ nombre: nombreEmpresa, admin_id: user!.id })
      .select()
      .single()

    if (!error && emp) {
      await supabase.from('users').update({
        empresa_id: emp.id,
        rol: 'admin'
      }).eq('id', user!.id)
      setEmpresa(emp)
    }
    setCreando(false)
  }

  const invitarVendedor = async () => {
    if (!emailInvitar || !empresa) return
    setInvitando(true)

    const token = Math.random().toString(36).slice(2) + Date.now()

    const { error } = await supabase
      .from('invitaciones')
      .insert({
        empresa_id: empresa.id,
        email: emailInvitar,
        token,
      })

    if (!error) {
      const link = `${window.location.origin}/unirse?token=${token}`
      await navigator.clipboard.writeText(link)
      alert(`Link copiado al portapapeles:\n${link}`)
      setEmailInvitar('')
    }
    setInvitando(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pb-10">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => window.location.href = '/dashboard'} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white">🏢 Mi Empresa</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {!empresa ? (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
            <p className="text-white font-semibold">Crear empresa</p>
            <p className="text-gray-400 text-sm">Creá tu empresa para invitar vendedores a tu equipo.</p>
            <input
              placeholder="Nombre de la empresa"
              value={nombreEmpresa}
              onChange={e => setNombreEmpresa(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={crearEmpresa}
              disabled={!nombreEmpresa || creando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl"
            >
              {creando ? 'Creando...' : '✅ Crear empresa'}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs font-semibold mb-1">EMPRESA</p>
              <p className="text-white font-bold text-lg">{empresa.nombre}</p>
              <p className="text-gray-400 text-xs mt-1">{vendedores.length} vendedores</p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
              <p className="text-gray-400 text-xs font-semibold">INVITAR VENDEDOR</p>
              <input
                placeholder="Email del vendedor"
                value={emailInvitar}
                onChange={e => setEmailInvitar(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={invitarVendedor}
                disabled={!emailInvitar || invitando}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl"
              >
                {invitando ? 'Generando link...' : '🔗 Generar link de invitación'}
              </button>
              <p className="text-gray-500 text-xs">El link se copia automáticamente. Mandáselo al vendedor por WhatsApp.</p>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-white font-semibold text-sm">Vendedores del equipo</p>
              </div>
              {vendedores.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-gray-400 text-sm">Sin vendedores todavía</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {vendedores.map(v => (
                    <div key={v.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{v.email}</p>
                        <p className="text-gray-400 text-xs">{v.rol} · {v.nombre || 'Sin nombre'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${v.rol === 'admin' ? 'bg-blue-900 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                        {v.rol}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
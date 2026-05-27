import { supabase } from './supabase/client'

export async function verificarSesion() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    window.location.href = '/login'
    return null
  }
  return user
}

export async function verificarSesionConPerfil() {
  const user = await verificarSesion()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!perfil) {
    window.location.href = '/onboarding'
    return null
  }

  return { user, perfil }
}
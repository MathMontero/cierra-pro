export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permiso = await Notification.requestPermission()
  return permiso === 'granted'
}

export async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const registro = await navigator.serviceWorker.register('/sw.js')
    return registro
  } catch (e) {
    console.error('SW error:', e)
    return null
  }
}

export function notificarLocal(titulo: string, cuerpo: string, url: string = '/') {
  if (Notification.permission !== 'granted') return
  new Notification(titulo, {
    body: cuerpo,
    icon: '/icons/icon-192.png',
  })
}
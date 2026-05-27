'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  mensaje: string
  tipo?: 'ok' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ mensaje, tipo = 'ok', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colores = {
    ok: 'bg-green-900 border-green-700 text-green-300',
    error: 'bg-red-900 border-red-700 text-red-300',
    info: 'bg-blue-900 border-blue-700 text-blue-300',
  }

  const emojis = { ok: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl p-4 border flex items-center gap-3 shadow-lg ${colores[tipo]}`}>
      <span className="text-xl">{emojis[tipo]}</span>
      <p className="font-medium text-sm flex-1">{mensaje}</p>
      <button onClick={onClose} className="text-lg opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

// Hook para usar el toast fácilmente
export function useToast() {
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'ok' | 'error' | 'info' } | null>(null)

  const mostrar = (mensaje: string, tipo: 'ok' | 'error' | 'info' = 'ok') => {
    setToast({ mensaje, tipo })
  }

  const cerrar = () => setToast(null)

  return { toast, mostrar, cerrar }
}
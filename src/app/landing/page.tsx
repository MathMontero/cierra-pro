'use client'

const WA = 'https://wa.me/5493624163340?text=' + encodeURIComponent('Hola! Me interesa Cierra+ PRO. ¿Me podés dar más información?')

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <h1 className="text-xl font-bold">Cierra+</h1>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = '/login'} className="text-sm text-gray-400 hover:text-white">Iniciar sesión</button>
          <button onClick={() => window.open(WA, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Empezar</button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 py-16 text-center max-w-2xl mx-auto">
        <div className="inline-block bg-blue-900/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          ✨ Asistente de ventas con IA
        </div>
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Cerrá más ventas.<br/>
          <span className="text-blue-400">Sin perder tiempo.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Cierra+ te ayuda a gestionar tus clientes, hacer seguimientos y detectar oportunidades — todo desde el celular.
        </p>
        <button onClick={() => window.open(WA, '_blank')} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors w-full max-w-sm flex items-center justify-center gap-2">
          💬 Hablar por WhatsApp
        </button>
        <p className="text-gray-500 text-sm mt-3">Te respondemos en minutos.</p>
      </div>

      {/* Features */}
      <div className="px-6 py-12 max-w-2xl mx-auto">
        <h3 className="text-center text-xl font-bold mb-8">Todo lo que necesitás para vender más</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { emoji: '🤖', title: 'IA que entiende tus clientes', desc: 'Pegá una conversación de WhatsApp y la IA detecta nombre, producto y teléfono automáticamente.' },
            { emoji: '🎯', title: 'Radar de oportunidades', desc: 'Detecta clientes que terminan su crédito y están listos para comprar de nuevo.' },
            { emoji: '⏰', title: 'Seguimientos automáticos', desc: 'Nunca más olvidés llamar a un cliente. Recibís recordatorios en el momento justo.' },
            { emoji: '📊', title: 'Embudo de ventas visual', desc: 'Ves exactamente en qué etapa está cada cliente y cuánto dinero tenés en juego.' },
            { emoji: '💬', title: 'WhatsApp con un toque', desc: 'Contactá a cualquier cliente directo desde la app sin buscar el número.' },
            { emoji: '📂', title: 'Importá tu lista existente', desc: 'Subí tu Excel o CSV y todos tus clientes aparecen en segundos.' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-start gap-4">
              <span className="text-3xl">{f.emoji}</span>
              <div>
                <p className="text-white font-semibold">{f.title}</p>
                <p className="text-gray-400 text-sm mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="px-6 py-12 max-w-2xl mx-auto">
        <h3 className="text-center text-xl font-bold mb-2">Un solo plan. Sin sorpresas.</h3>
        <p className="text-center text-gray-400 text-sm mb-8">Todo incluido por un precio fijo mensual.</p>
        <div className="bg-gray-900 rounded-2xl p-6 border-2 border-blue-500 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            MÁS POPULAR
          </div>
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm">Cierra+ PRO</p>
            <p className="text-4xl font-bold mt-1">Consultanos<span className="text-lg text-gray-400"> el precio</span></p>
          </div>
          <div className="space-y-3 mb-6">
            {[
              'Clientes ilimitados',
              'IA para detectar clientes',
              'Radar de oportunidades',
              'Seguimientos y recordatorios',
              'Embudo de ventas',
              'Importación Excel/CSV',
              'Estadísticas completas',
              'Soporte por WhatsApp',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-green-400 text-sm">✓</span>
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => window.open(WA, '_blank')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
            💬 Consultar por WhatsApp
          </button>
        </div>
      </div>

      {/* CTA final */}
      <div className="px-6 py-12 text-center bg-gray-900 border-t border-gray-800">
        <h3 className="text-2xl font-bold mb-2">¿Listo para vender más?</h3>
        <p className="text-gray-400 mb-6">Hablemos y te mostramos cómo funciona</p>
        <button onClick={() => window.open(WA, '_blank')} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2 mx-auto">
          💬 Hablar por WhatsApp
        </button>
      </div>
    </div>
  )
}
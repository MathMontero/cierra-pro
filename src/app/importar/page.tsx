'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

const NAV = [
  { emoji: '🏠', label: 'Inicio', href: '/dashboard' },
  { emoji: '👥', label: 'Clientes', href: '/clientes' },
  { emoji: '📊', label: 'Embudo', href: '/embudo' },
  { emoji: '🎯', label: 'Radar', href: '/radar' },
  { emoji: '✨', label: 'IA', href: '/ia' },
]

export default function ImportarPage() {
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [preview, setPreview] = useState<any[]>([])

  const procesarArchivo = async (file: File) => {
    setProcesando(true)
    setResultado(null)
    setPreview([])

    try {
      let clientes: any[] = []

      if (file.name.endsWith('.txt')) {
        clientes = await procesarChatWhatsApp(file)
      } else if (file.name.endsWith('.csv')) {
        const texto = await file.text()
        const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true })
        clientes = mapearFilas(parsed.data as any[])
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        const wb = XLSX.read(buffer, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        clientes = mapearFilas(XLSX.utils.sheet_to_json(ws))
      } else {
        alert('Solo se aceptan .xlsx, .xls, .csv o .txt de WhatsApp')
        setProcesando(false)
        return
      }

      if (clientes.length === 0) {
        alert('No se encontraron clientes en el archivo')
        setProcesando(false)
        return
      }

      setPreview(clientes.slice(0, 5))

      const { data: { user } } = await supabase.auth.getUser()
      let creados = 0
      let errores = 0

      for (const cliente of clientes) {
        const { error } = await supabase.from('clientes').insert({
          ...cliente,
          user_id: user!.id,
          estado: 'nuevo',
          prioridad: 'media',
          fecha_consulta: new Date().toISOString().split('T')[0],
        })
        if (error) errores++
        else creados++
      }

      setResultado({ total: clientes.length, creados, errores })
    } catch (e: any) {
      alert('Error: ' + e.message)
    }

    setProcesando(false)
  }

  const procesarChatWhatsApp = async (file: File): Promise<any[]> => {
    const texto = await file.text()
    const lineas = texto.split('\n')
    const clientesMap: Record<string, any> = {}

    for (const linea of lineas) {
      const matchNombre = linea.match(/- ([^:]+):/)
      if (!matchNombre) continue

      const autor = matchNombre[1].trim()
      if (autor === 'Vos' || autor === 'You' || autor.length > 40) continue

      const contenido = linea.split(': ').slice(1).join(': ').trim()

      if (!clientesMap[autor]) {
        clientesMap[autor] = {
          nombre: autor,
          telefono: '',
          observaciones: contenido.slice(0, 200),
          producto: '',
        }
      }

      const telMatch = contenido.match(/(\+?[\d\s\-]{8,15})/)
      if (telMatch && !clientesMap[autor].telefono) {
        clientesMap[autor].telefono = telMatch[1].replace(/\s|-/g, '')
      }

      const palabrasProducto = ['moto', 'auto', 'heladera', 'lavarropas', 'tv', 'celular', 'notebook', 'aire', 'frozen', 'wave', 'bajaj', 'honda', 'yamaha']
      for (const palabra of palabrasProducto) {
        if (contenido.toLowerCase().includes(palabra) && !clientesMap[autor].producto) {
          clientesMap[autor].producto = palabra.charAt(0).toUpperCase() + palabra.slice(1)
        }
      }
    }

    return Object.values(clientesMap).filter(c => c.nombre)
  }

  const mapearFilas = (filas: any[]) => {
    if (filas.length === 0) return []
    const columnas = Object.keys(filas[0])
    const buscar = (palabras: string[]) => columnas.find(c => palabras.some(p => c.toLowerCase().includes(p))) || ''
    const mapeo = {
      nombre: buscar(['nombre', 'name', 'cliente']),
      telefono: buscar(['telefono', 'tel', 'phone', 'celular']),
      producto: buscar(['producto', 'product', 'articulo']),
      monto: buscar(['monto', 'precio', 'price', 'importe']),
      observaciones: buscar(['observacion', 'nota', 'comentario']),
    }
    return filas.map(fila => ({
      nombre: fila[mapeo.nombre] || '',
      telefono: fila[mapeo.telefono] || '',
      producto: fila[mapeo.producto] || '',
      monto_estimado: fila[mapeo.monto] ? Number(String(fila[mapeo.monto]).replace(/[^0-9.]/g, '')) : null,
      observaciones: fila[mapeo.observaciones] || '',
    })).filter(c => c.nombre)
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-24">
      <div className="bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">📂 Importar Clientes</h1>
        <p className="text-gray-400 text-sm mt-1">Excel, CSV o chat de WhatsApp</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div
          className="bg-gray-900 rounded-2xl p-8 border-2 border-dashed border-gray-700 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <p className="text-4xl mb-3">📁</p>
          <p className="text-white font-medium">Tocá para seleccionar archivo</p>
          <p className="text-gray-400 text-sm mt-1">Excel (.xlsx), CSV (.csv) o WhatsApp (.txt)</p>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv,.txt"
            className="hidden"
            onChange={e => e.target.files?.[0] && procesarArchivo(e.target.files[0])}
          />
        </div>

        <div className="bg-blue-950 rounded-2xl p-4 border border-blue-800">
          <p className="text-blue-400 text-xs font-semibold mb-2">CÓMO EXPORTAR CHAT DE WHATSAPP</p>
          <div className="space-y-1 text-gray-300 text-xs">
            <p>1. Abrí el chat en WhatsApp</p>
            <p>2. Tocá los 3 puntitos → Más → Exportar chat</p>
            <p>3. Elegí "Sin archivos multimedia"</p>
            <p>4. Guardá el archivo .txt y subilo acá</p>
          </div>
        </div>

        {procesando && (
          <div className="bg-blue-950 rounded-2xl p-4 border border-blue-800 text-center">
            <p className="text-blue-400">⚙️ Procesando archivo...</p>
          </div>
        )}

        {resultado && (
          <div className={'rounded-2xl p-4 border ' + (resultado.errores === 0 ? 'bg-green-950 border-green-800' : 'bg-yellow-950 border-yellow-800')}>
            <p className={'text-xs font-semibold mb-2 ' + (resultado.errores === 0 ? 'text-green-400' : 'text-yellow-400')}>RESULTADO</p>
            <p className="text-white text-sm">✅ {resultado.creados} clientes importados</p>
            {resultado.errores > 0 && <p className="text-yellow-400 text-sm">⚠️ {resultado.errores} errores</p>}
            <button onClick={() => window.location.href = '/clientes'} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-3">
              Ver clientes →
            </button>
          </div>
        )}

        {preview.length > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs font-semibold mb-3">VISTA PREVIA</p>
            <div className="space-y-2">
              {preview.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm">{c.nombre}</p>
                    <p className="text-gray-400 text-xs">{c.telefono} {c.producto && '· ' + c.producto}</p>
                  </div>
                </div>
              ))}
            </div>
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
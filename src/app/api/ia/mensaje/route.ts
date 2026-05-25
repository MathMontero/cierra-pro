import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { nombre, tipo } = await req.json()

    const tipos: Record<string, string> = {
      reactivacion: 'reactivar un cliente que no compró hace tiempo',
      renovacion: 'ofrecer renovación a un cliente que está terminando su crédito',
      seguimiento: 'hacer seguimiento de una consulta pendiente',
      oferta: 'comunicar una oferta especial',
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sos vendedor argentino. Escribí un mensaje de WhatsApp corto y amigable para ${tipos[tipo] || tipo}. Máximo 3 párrafos. Sin emojis exagerados. Tono cercano.`
        },
        { role: 'user', content: `Cliente: ${nombre}` }
      ],
      temperature: 0.7,
    })

    return NextResponse.json({ mensaje: response.choices[0].message.content })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, mensaje: '' }, { status: 500 })
  }
}
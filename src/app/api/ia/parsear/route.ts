import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json()
    console.log('API KEY:', process.env.OPENAI_API_KEY?.slice(0, 10))
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extraé datos del cliente y devolvé SOLO JSON:
{"nombre":null,"telefono":null,"producto":null,"monto_estimado":null,"observaciones":null}`
        },
        { role: 'user', content: texto }
      ],
      temperature: 0.1,
    })

    const cliente = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json({ cliente })
  } catch (error: any) {
    console.error('ERROR IA:', error.message)
    return NextResponse.json({ error: error.message, cliente: {} }, { status: 500 })
  }
}
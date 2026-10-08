import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, Bot } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { answerQuestion } from '../lib/assistant'
import type { ChatMessage } from '../types'

const SUGGESTIONS = [
  'Quelles missions sont urgentes ?',
  'Quelles factures sont en retard ?',
  'Combien de missions sont en cours ?',
  'Quels sont nos clients prospects ?',
  'Quelles tâches urgentes sont en attente ?',
]

function nowIso() {
  return new Date().toISOString()
}

export function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Bonjour Amina, je suis l'assistant IA de HRCC. Posez-moi une question sur vos clients, missions, tâches ou factures.",
      timestamp: nowIso(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send(content: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, timestamp: nowIso() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setTyping(true)

    // Overlap the real data fetch with a minimum "thinking" delay so the
    // typing indicator never flashes faster than it would against Supabase.
    Promise.all([answerQuestion(trimmed), new Promise((resolve) => setTimeout(resolve, 500))])
      .then(([content]) => {
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content,
          timestamp: nowIso(),
        }
        setMessages((prev) => [...prev, reply])
      })
      .catch(() => {
        const reply: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Désolé, une erreur est survenue en consultant les données. Réessayez dans un instant.",
          timestamp: nowIso(),
        }
        setMessages((prev) => [...prev, reply])
      })
      .finally(() => setTyping(false))
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <PageHeader title="Assistant IA" description="Posez vos questions en langage naturel sur votre activité" />

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                ) : (
                  <Avatar name="Amina Belkacemi" size="sm" />
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-tr-sm bg-indigo-600 text-white'
                      : 'rounded-tl-sm bg-slate-100 text-slate-700'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Sparkles className="h-3 w-3" />
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question..."
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={!input.trim()}
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

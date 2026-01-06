'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Send, Volume2 } from 'lucide-react'

interface LiveQnAProps {
  pitchContext: {
    pitch_summary: string
    weak_points: string[]
    questions_for_founder: string[]
    red_flags: string[]
  }
  onEnd: () => void
}

export default function LiveQnA({ pitchContext, onEnd }: LiveQnAProps) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
  }>>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInitialized) {
      initializeConversation()
    }
  }, [isInitialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeConversation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          pitchContext,
          isInitial: true,
        }),
      })

      if (!response.ok) {
        throw new Error('خطا در شروع مکالمه')
      }

      const data = await response.json()
      setMessages([{ role: 'assistant', content: data.message }])
      setIsInitialized(true)
    } catch (error: any) {
      console.error('Error initializing conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = inputText.trim()
    setInputText('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          pitchContext,
          isInitial: false,
        }),
      })

      if (!response.ok) {
        throw new Error('خطا در ارسال پیام')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error: any) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.',
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          فاز 2: مکالمه زنده با VC AI
        </h2>
        <p className="text-gray-600">
          مصاحبه واقعی - سوالات چالشی و follow-up بر اساس تحلیل پیچ شما
        </p>
      </div>

      {/* Conversation Area */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 h-96 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-8">
            در حال شروع مکالمه...
          </p>
        )}

        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm font-semibold mb-1 opacity-80">
                  {msg.role === 'user' ? 'شما' : 'VC AI'}
                </p>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="پاسخ خود را بنویسید..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
          disabled={isLoading || !isInitialized}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !inputText.trim() || !isInitialized}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* End Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={onEnd}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
        >
          پایان مکالمه
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2">💡 نکات مهم:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>AI بر اساس تحلیل پیچ شما سوالات چالشی می‌پرسد</li>
          <li>به سوالات به صورت مستقیم و واضح پاسخ دهید</li>
          <li>اگر جواب vague بدهید، AI سوالات follow-up می‌پرسد</li>
          <li>این یک شبیه‌سازی واقعی جلسه سرمایه‌گذاری است</li>
        </ul>
      </div>
    </div>
  )
}


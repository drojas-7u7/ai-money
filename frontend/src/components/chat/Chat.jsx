import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertTriangle, MessageSquare } from 'lucide-react'
import styles from './Chat.module.css'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowBot}`}>
      <div className={styles.avatar}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBot}`}>
        <p className={styles.bubbleText}>{msg.content}</p>
        {msg.check_question && (
          <p className={styles.checkQuestion}>{msg.check_question}</p>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
      <div className={styles.avatar}><Bot size={16} /></div>
      <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typingBubble}`}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  )
}

function Chat({ messages = [], onSend, isLoading = false, error = null, profile = null }) {
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInput = (e) => {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
  }

  const isEmpty = messages.length === 0

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Chat financiero</h2>

      <div className={styles.chatBox}>
        <div className={styles.messageList}>
          {isEmpty && !isLoading && (
            <div className={styles.emptyState}>
              <MessageSquare size={36} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>
                {profile
                  ? `Hola, ${profile.alias}. Pregúntame lo que quieras sobre tus finanzas.`
                  : 'Selecciona un perfil para empezar a chatear.'}
              </p>
              <p className={styles.emptyHint}>
                Puedo ayudarte a entender tu situación financiera, interpretar tu nómina o planificar tus ahorros.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
            rows={1}
            maxLength={2000}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? <Loader2 size={18} className={styles.spinIcon} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat

import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle className="text-green-500 shrink-0" size={20} />,
  error:   <AlertCircle className="text-red-500 shrink-0" size={20} />,
  info:    <Info className="text-primary-500 shrink-0" size={20} />,
}

const borders = { success: 'border-l-green-500', error: 'border-l-red-500', info: 'border-l-primary-500' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={`bg-white border border-gray-200 border-l-4 ${borders[t.type]} rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-right`}>
            {icons[t.type]}
            <p className="text-sm text-gray-800 flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

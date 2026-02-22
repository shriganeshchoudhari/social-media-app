export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-gray-900">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 text-sm border rounded-lg outline-none transition-all duration-200
          border-gray-300 focus:border-primary-500 focus:ring-3 focus:ring-primary-100
          disabled:bg-gray-100 disabled:text-gray-500
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

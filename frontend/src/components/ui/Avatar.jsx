const sizes = { xs: 6, sm: 8, md: 10, lg: 12, xl: 16, '2xl': 24 }

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const px   = sizes[size] || 10
  const text = name ? name.charAt(0).toUpperCase() : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`rounded-full object-cover shrink-0 w-${px} h-${px} ${className}`}
      />
    )
  }
  return (
    <div
      className={`rounded-full bg-primary-500 text-white flex items-center justify-center shrink-0 font-semibold w-${px} h-${px} ${className}`}
      style={{ fontSize: px * 4 * 0.4 + 'px' }}
    >
      {text}
    </div>
  )
}

import { getInitials, stringToColor } from '../utils/formatters';

/**
 * Avatar component — shows profile picture or generated initials fallback
 * size: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  const baseClass = `rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white ${sizeClasses[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${baseClass} object-cover`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.style.setProperty('display', 'flex'); }}
      />
    );
  }

  return (
    <div
      className={baseClass}
      style={{ backgroundColor: stringToColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;

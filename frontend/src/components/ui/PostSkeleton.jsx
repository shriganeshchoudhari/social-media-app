/**
 * PostSkeleton — animated placeholder while posts are loading.
 * Matches the visual structure of PostCard so the layout doesn't shift.
 */
export default function PostSkeleton() {
  return (
    <article className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Name + meta */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>

          {/* Content lines */}
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3.5 w-4/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3.5 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Action row */}
          <div className="flex items-center gap-5 mt-4">
            <div className="h-4 w-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-4 w-8  rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Feed-level skeleton — renders N post skeletons.
 */
export function FeedSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </>
  )
}

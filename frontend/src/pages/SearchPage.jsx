import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { searchUsers, searchPosts, searchHashtags } from '../api/search.js'
import PostCard from '../components/post/PostCard.jsx'
import UserCard from '../components/user/UserCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const TABS = ['Posts', 'Users', 'Hashtags']

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [tab, setTab]         = useState('Posts')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runSearch(query, tab, 0)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query, tab])

  const runSearch = async (q, t, page = 0) => {
    setLoading(true)
    try {
      let data
      if (t === 'Posts')    ({ data } = await searchPosts(q, page))
      else if (t === 'Users')    ({ data } = await searchUsers(q, page))
      else                       ({ data } = await searchHashtags(q, page))
      setResults(page === 0 ? data.content : prev => [...prev, ...data.content])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Search bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts, users, hashtags…"
            className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        {!query.trim() ? (
          <div className="flex flex-col items-center py-16 gap-2 text-center px-4">
            <Search size={40} className="text-gray-300" />
            <p className="text-gray-500 text-sm">Start typing to search</p>
          </div>
        ) : loading && results.length === 0 ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">No results for "{query}"</p>
        ) : tab === 'Posts' || tab === 'Hashtags' ? (
          results.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          results.map(user => <UserCard key={user.id} user={user} />)
        )}
        {loading && results.length > 0 && (
          <div className="flex justify-center py-4"><Spinner /></div>
        )}
      </div>
    </div>
  )
}

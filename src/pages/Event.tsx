import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import OutfitPost from '@/components/OutfitPost'
import { Button } from '@/components/ui/button'
import type { Event as EventType, OutfitPost as OutfitPostType } from '@/lib/database.types'
import { Copy, Check } from 'lucide-react'

type PostWithProfile = OutfitPostType & {
  profiles: { display_name: string | null } | null
}

export default function Event() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const { user } = useAuth()

  const [event, setEvent] = useState<EventType | null>(null)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [description, setDescription] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  const [copied, setCopied] = useState(false)

  const fetchPosts = useCallback(async (eventId: string) => {
    const { data } = await supabase
      .from('outfit_posts')
      .select('*, profiles(display_name)')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    setPosts((data as PostWithProfile[]) ?? [])
  }, [])

  useEffect(() => {
    if (!inviteCode) return
    supabase
      .from('events')
      .select('*')
      .eq('invite_code', inviteCode)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setEvent(data)
          fetchPosts(data.id)
        }
        setLoadingEvent(false)
      })
  }, [inviteCode, fetchPosts])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = description.trim()
    if (!trimmed || trimmed.length < 2 || trimmed.length > 500) {
      setPostError('Description must be 2–500 characters.')
      return
    }
    if (!user || !event) return
    setPosting(true)
    setPostError(null)
    const { error } = await supabase.from('outfit_posts').insert({
      event_id: event.id,
      user_id: user.id,
      description: trimmed,
    })
    setPosting(false)
    if (error) {
      setPostError(error.message)
      return
    }
    setDescription('')
    fetchPosts(event.id)
  }

  async function copyInviteLink() {
    const url = `${window.location.origin}/event/${inviteCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedDate = event?.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  if (loadingEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-700 font-medium">Event not found.</p>
          <Link to="/" className="mt-3 inline-block text-sm text-violet-600 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-violet-600">shareWear</Link>
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event?.name}</h1>
              {formattedDate && (
                <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
              )}
            </div>
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
              title="Copy invite link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        {user ? (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-900 mb-3">What are you wearing?</h2>
            <form onSubmit={handlePost} className="space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Black blazer, white tee, straight-leg jeans…"
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              />
              {postError && <p className="text-sm text-red-600">{postError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{description.length}/500</span>
                <Button type="submit" size="sm" disabled={posting}>
                  {posting ? 'Posting…' : 'Post outfit'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
            <Link to="/login" className="font-medium underline">Sign in</Link> to post your outfit.
          </div>
        )}

        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-gray-500 text-sm">No outfits posted yet. Be the first!</p>
            </div>
          ) : (
            posts.map((post) => <OutfitPost key={post.id} post={post} />)
          )}
        </div>
      </main>
    </div>
  )
}

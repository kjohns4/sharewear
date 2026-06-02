import type { OutfitPost as OutfitPostType } from '@/lib/database.types'

type Props = {
  post: OutfitPostType & { profiles: { display_name: string | null } | null }
}

export default function OutfitPost({ post }: Props) {
  const displayName = post.profiles?.display_name ?? 'Anonymous'
  const timeAgo = formatRelativeTime(new Date(post.created_at))

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 text-sm">{displayName}</span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
        {post.description}
      </p>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

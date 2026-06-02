import { Link } from 'react-router-dom'
import type { Event } from '@/lib/database.types'

type Props = { event: Event }

export default function EventCard({ event }: Props) {
  const formattedDate = event.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <Link
      to={`/event/${event.invite_code}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="font-semibold text-gray-900 truncate">{event.name}</h2>
      {formattedDate && (
        <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
      )}
    </Link>
  )
}

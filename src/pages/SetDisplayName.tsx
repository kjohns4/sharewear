import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SetDisplayName() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2 || trimmed.length > 40) {
      setError('Name must be 2–40 characters.')
      return
    }
    if (!user) return
    setLoading(true)
    setError(null)
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: trimmed })
    setLoading(false)
    if (upsertError) {
      setError(upsertError.message)
    }
    // On success the parent router re-renders because profile is now set
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow border border-gray-200">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Welcome to shareWear</h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose a display name so your friends know who you are.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              type="text"
              placeholder="e.g. Jamie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Set display name'}
          </Button>
        </form>
      </div>
    </div>
  )
}

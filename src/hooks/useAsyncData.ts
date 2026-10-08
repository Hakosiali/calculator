import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

// Minimal data-fetching hook for pages migrated to the async dataClient
// (see src/lib/dataClient.ts). Re-fetches whenever a value in `deps`
// changes, same idea as useEffect's dependency array.
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: undefined, loading: false, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

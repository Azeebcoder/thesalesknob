// Fetches published entries for a collection and guards against stale responses.
import { useEffect, useState } from 'react'
import { api } from './api'

// Returns published collection entries with loading state for the requested collection.
export function usePublishedContent(collection) {
  const [state, setState] = useState(() => ({ collection, entries: [], loading: true }))

  useEffect(() => {
    let active = true
    api.publicContent(collection)
      .then(({ entries: publishedEntries }) => {
        if (active) setState({ collection, entries: publishedEntries, loading: false })
      })
      .catch((error) => {
        if (active) {
          setState({ collection, entries: [], loading: false })
          console.error(`Could not load published ${collection} content:`, error)
        }
      })

    return () => {
      active = false
    }
  }, [collection])

  return state.collection === collection ? state : { entries: [], loading: true }
}

import { create } from 'zustand'

type ReEvalState = {
  hodPendingIds: string[]
  resolvedIds: string[]
  addHodPending: (id: string) => void
  addResolved: (id: string) => void
  getStatus: (id: string) => 'hod' | 'resolved' | 'pending'
}

export const useReEvalStore = create<ReEvalState>((set, get) => ({
  hodPendingIds: [],
  resolvedIds: [],
  addHodPending: (id) =>
    set((s) => ({ hodPendingIds: [...s.hodPendingIds.filter((x) => x !== id), id] })),
  addResolved: (id) =>
    set((s) => ({ resolvedIds: [...s.resolvedIds.filter((x) => x !== id), id] })),
  getStatus: (id) => {
    const { hodPendingIds, resolvedIds } = get()
    if (resolvedIds.includes(id)) return 'resolved'
    if (hodPendingIds.includes(id)) return 'hod'
    return 'pending'
  },
}))

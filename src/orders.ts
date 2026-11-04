import type { Deadline, Tier } from './pricing'
import { DEADLINES } from './pricing'
import { useStored } from './storage'

export const ORDER_STAGES = ['received', 'translating', 'reviewing', 'ready'] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export const STAGE_LABELS: Record<OrderStage, string> = {
  received: 'Хүлээн авсан',
  translating: 'Орчуулж байна',
  reviewing: 'Хянаж байна',
  ready: 'Бэлэн',
}

export interface Order {
  id: string
  createdAt: string
  customer: 'person' | 'business'
  fileName: string
  docType: string
  words: number
  pair: string
  tier: Tier
  deadline: Deadline
  total: number
  stage: OrderStage
}

export const ORDERS_KEY = 'tp.orders'

export function newOrderId(existing: Order[]): string {
  const n = existing.length + 1001
  return `ORD-${n}`
}

export function dueDate(order: Pick<Order, 'createdAt' | 'deadline'>): Date {
  const d = new Date(order.createdAt)
  d.setDate(d.getDate() + DEADLINES[order.deadline].days)
  return d
}

export function nextStage(stage: OrderStage): OrderStage {
  const i = ORDER_STAGES.indexOf(stage)
  return ORDER_STAGES[Math.min(i + 1, ORDER_STAGES.length - 1)]
}

export function useOrders() {
  return useStored<Order[]>(ORDERS_KEY, [])
}

export function formatDate(d: Date | string): string {
  const x = typeof d === 'string' ? new Date(d) : d
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${x.getFullYear()}.${pad(x.getMonth() + 1)}.${pad(x.getDate())}`
}

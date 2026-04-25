import { getActiveGardenId } from './database'
import { getSupabaseClient } from './supabase'

export type RealtimeTable =
  | 'gardens'
  | 'income_records'
  | 'debt_records'
  | 'worker_expenses'
  | 'food_expenses'
  | 'fertilizer_expenses'
  | 'transport_expenses'
  | 'energy_expenses'
  | 'oil_expenses'
  | 'remont_expenses'
  | 'tax_expenses'
  | 'drainage_expenses'

interface SubscribeOptions {
  channelKey: string
  tables: RealtimeTable[]
  onChange: () => void | Promise<void>
}

export async function subscribeToGardenTables({
  channelKey,
  tables,
  onChange,
}: SubscribeOptions) {
  const client = getSupabaseClient()
  const gardenId = await getActiveGardenId()
  let channel = client.channel(channelKey)

  for (const table of tables) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: table === 'gardens' ? `id=eq.${gardenId}` : `garden_id=eq.${gardenId}`,
      },
      () => {
        void onChange()
      },
    )
  }

  channel.subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}

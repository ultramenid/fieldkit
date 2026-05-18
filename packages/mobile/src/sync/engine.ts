export async function syncAll(): Promise<{ synced: number; errors: number }> {
  return { synced: 0, errors: 0 }
}

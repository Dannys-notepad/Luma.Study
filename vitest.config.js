import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 15000, // 15s test timeout for cold start Firestore network connections
    hookTimeout: 15000,
    fileParallelism: false
  }
})

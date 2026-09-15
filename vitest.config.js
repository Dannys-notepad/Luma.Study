import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 90000, // 90s test timeout for cold start Firestore network connections
    hookTimeout: 90000,
    fileParallelism: false
  }
})

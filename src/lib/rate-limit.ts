// src/lib/rate-limit.ts

type RateLimitOptions = {
  windowMs: number // Thời gian của cửa sổ trượt (mili-giây)
  max: number      // Số lượng yêu cầu tối đa cho phép
}

// Bộ lưu trữ trong bộ nhớ đệm
const memoryStore = new Map<string, number[]>()

// Dọn dẹp các bản ghi cũ quá thời gian cửa sổ
function pruneStore(key: string, now: number, windowMs: number) {
  const timestamps = memoryStore.get(key)
  if (!timestamps) return

  const validTimestamps = timestamps.filter(time => now - time < windowMs)
  if (validTimestamps.length === 0) {
    memoryStore.delete(key)
  } else {
    memoryStore.set(key, validTimestamps)
  }
}

/**
 * Thực hiện kiểm tra giới hạn tần suất gọi API
 * @param key Khóa xác định duy nhất (ví dụ: IP_API hoặc USER_ID_API)
 * @param options Cấu hình giới hạn
 * @returns Trạng thái thành công, số lượng hiện tại và giới hạn tối đa
 */
export function rateLimit(key: string, options: RateLimitOptions): { success: boolean; count: number; limit: number } {
  const now = Date.now()
  
  // Dọn dẹp trước
  pruneStore(key, now, options.windowMs)

  const currentTimestamps = memoryStore.get(key) || []
  
  if (currentTimestamps.length >= options.max) {
    return {
      success: false,
      count: currentTimestamps.length,
      limit: options.max,
    }
  }

  currentTimestamps.push(now)
  memoryStore.set(key, currentTimestamps)

  return {
    success: true,
    count: currentTimestamps.length,
    limit: options.max,
  }
}

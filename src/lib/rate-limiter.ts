interface RateLimiterOptions {
  maxRequests: number;
  timeWindowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.timeWindowMs = options.timeWindowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove expired timestamps
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindowMs
    );

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindowMs
    );
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindowMs - (Date.now() - oldestRequest));
  }
}

// Create default rate limiter instance
export const defaultRateLimiter = new RateLimiter({
  maxRequests: 10000,  // 100 requests
  timeWindowMs: 60000 // per minute
});

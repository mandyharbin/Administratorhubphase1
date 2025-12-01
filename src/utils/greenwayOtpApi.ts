// Mock implementation of Greenway Phone OTP API
// Based on the OpenAPI specification

export interface Phone {
  value: string; // E.164 format: +16135551212
}

export interface RequestOtpRequest {
  phone: string;
  userId?: string;
  purpose: 'registration' | 'mfa' | 'recovery' | 'verification';
  channel: 'sms' | 'email';
  correlationId?: string;
  idempotencyKey?: string;
}

export interface RequestOtpResponse {
  requestId: string;
  ttlSeconds: number;
  resendCooldownSeconds: number;
  message: string;
}

export interface VerifyOtpRequest {
  phone: string;
  requestId: string;
  code: string;
  correlationId?: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  verifiedAt?: string;
  remainingAttempts?: number;
  lockoutExpires?: string | null;
  proofToken?: string;
}

export interface ConsentRequest {
  phone: string;
  userId?: string;
  consentGiven: boolean;
  consentMethod: 'in-app' | 'web' | 'invite';
  ip?: string;
  userAgent?: string;
}

export interface ConsentResponse {
  consentId: string;
  recordedAt: string;
}

export interface ApiError {
  error: string;
  lockoutExpires?: string;
}

// Mock storage for OTP sessions
interface OtpSession {
  requestId: string;
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  lockedUntil?: number;
}

const otpSessions = new Map<string, OtpSession>();
const consentRecords = new Map<string, ConsentResponse>();
const rateLimitMap = new Map<string, number[]>();

// Mock implementation
export class GreenwayOtpApi {
  private baseUrl: string;
  private bearerToken: string;

  constructor(baseUrl: string = 'https://sandbox.api.greenway.example.com', bearerToken: string = 'mock-token') {
    this.baseUrl = baseUrl;
    this.bearerToken = bearerToken;
  }

  // POST /v1/phone/otp/request
  async requestOtp(request: RequestOtpRequest): Promise<RequestOtpResponse> {
    // Check consent
    if (!consentRecords.has(request.phone)) {
      throw {
        status: 403,
        error: 'Consent required for phone usage. Please capture TCPA consent before requesting OTP.',
      };
    }

    // Check rate limiting (max 3 requests per 5 minutes per phone)
    const now = Date.now();
    const phoneRateLimits = rateLimitMap.get(request.phone) || [];
    const recentRequests = phoneRateLimits.filter(time => now - time < 5 * 60 * 1000);
    
    if (recentRequests.length >= 3) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + 5 * 60 * 1000 - now) / 1000);
      throw {
        status: 429,
        error: 'Rate limit exceeded. Too many OTP requests.',
        retryAfter,
      };
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = `req_${crypto.randomUUID()}`;
    const ttlSeconds = 300; // 5 minutes

    // Store session
    otpSessions.set(requestId, {
      requestId,
      phone: request.phone,
      code,
      expiresAt: now + ttlSeconds * 1000,
      attempts: 0,
      maxAttempts: 5,
    });

    // Update rate limit
    recentRequests.push(now);
    rateLimitMap.set(request.phone, recentRequests);

    // Simulate SMS sending delay
    await this.simulateDelay(500);

    console.log(`[Greenway OTP Mock] Sent OTP ${code} to ${request.phone} (requestId: ${requestId})`);

    return {
      requestId,
      ttlSeconds,
      resendCooldownSeconds: 60,
      message: `OTP sent to ${request.phone}`,
    };
  }

  // POST /v1/phone/otp/verify
  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const session = otpSessions.get(request.requestId);

    if (!session) {
      throw {
        status: 400,
        error: 'Invalid request ID',
      };
    }

    const now = Date.now();

    // Check if locked
    if (session.lockedUntil && now < session.lockedUntil) {
      throw {
        status: 423,
        error: 'Account locked due to too many failed attempts',
        lockoutExpires: new Date(session.lockedUntil).toISOString(),
      };
    }

    // Check if expired
    if (now > session.expiresAt) {
      otpSessions.delete(request.requestId);
      throw {
        status: 410,
        error: 'OTP has expired',
      };
    }

    // Check if phone matches
    if (session.phone !== request.phone) {
      throw {
        status: 400,
        error: 'Phone number does not match',
      };
    }

    // Increment attempts
    session.attempts++;

    // Verify code
    if (session.code === request.code) {
      // Success!
      const verifiedAt = new Date().toISOString();
      const proofToken = `proof_${crypto.randomUUID()}`;
      
      // Clean up session
      otpSessions.delete(request.requestId);

      console.log(`[Greenway OTP Mock] OTP verified successfully for ${request.phone}`);

      return {
        verified: true,
        verifiedAt,
        proofToken,
      };
    } else {
      // Failed attempt
      const remainingAttempts = session.maxAttempts - session.attempts;

      if (remainingAttempts <= 0) {
        // Lock account for 15 minutes
        session.lockedUntil = now + 15 * 60 * 1000;
        const lockoutExpires = new Date(session.lockedUntil).toISOString();

        console.log(`[Greenway OTP Mock] Account locked for ${request.phone} until ${lockoutExpires}`);

        throw {
          status: 423,
          error: 'Too many failed attempts. Account locked.',
          lockoutExpires,
        };
      }

      console.log(`[Greenway OTP Mock] Invalid OTP for ${request.phone}. ${remainingAttempts} attempts remaining`);

      return {
        verified: false,
        remainingAttempts,
        lockoutExpires: null,
      };
    }
  }

  // POST /v1/phone/consent
  async captureConsent(request: ConsentRequest): Promise<ConsentResponse> {
    const consentId = `consent_${crypto.randomUUID()}`;
    const recordedAt = new Date().toISOString();

    const response: ConsentResponse = {
      consentId,
      recordedAt,
    };

    if (request.consentGiven) {
      consentRecords.set(request.phone, response);
      console.log(`[Greenway OTP Mock] Consent recorded for ${request.phone} (${consentId})`);
    } else {
      consentRecords.delete(request.phone);
      console.log(`[Greenway OTP Mock] Consent revoked for ${request.phone}`);
    }

    await this.simulateDelay(200);

    return response;
  }

  // Helper to get OTP code (for demo purposes only!)
  getOtpCode(requestId: string): string | null {
    const session = otpSessions.get(requestId);
    return session ? session.code : null;
  }

  // Helper to check if phone has consent
  hasConsent(phone: string): boolean {
    return consentRecords.has(phone);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const greenwayOtpApi = new GreenwayOtpApi();

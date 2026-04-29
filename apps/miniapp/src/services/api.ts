import { buildApiUrl, isLocalApi } from '../config/api'

export interface AiAskParams {
  question: string
  pet?: Record<string, unknown>
  mode?: 'general' | 'symptom' | 'diet' | 'visit-summary'
}

export interface AiAskResult {
  id: string
  answer: string
  riskLevel: 'green' | 'yellow' | 'red'
  citations?: Array<{ id: string; title: string }>
  needsVet: boolean
  disclaimer: string
}

export interface FeedbackParams {
  conversationId: string
  feedbackType: 'wrong' | 'unsafe' | 'too_generic' | 'not_applicable' | 'helpful'
  feedbackText?: string
  expectedAnswer?: string
}

/**
 * Ask AI a pet care question
 */
export function askAi(params: AiAskParams): Promise<AiAskResult> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildApiUrl('/api/ai/ask'),
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: params,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as AiAskResult)
        } else {
          reject(new Error(`API error: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Network error'))
      }
    })
  })
}

/**
 * Submit user feedback on an AI response
 */
export function submitFeedback(params: FeedbackParams): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildApiUrl('/api/feedback'),
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: params,
      success: (res) => {
        if (res.statusCode === 200) resolve()
        else reject(new Error(`Feedback error: ${res.statusCode}`))
      },
      fail: (err) => reject(new Error(err.errMsg))
    })
  })
}

/**
 * Get app bootstrap config
 */
export function getBootstrap(): Promise<{ appName: string; supportedSpecies: string[]; modes: string[] }> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildApiUrl('/api/bootstrap'),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) resolve(res.data as any)
        else reject(new Error(`Bootstrap error: ${res.statusCode}`))
      },
      fail: (err) => reject(new Error(err.errMsg))
    })
  })
}

export { isLocalApi }

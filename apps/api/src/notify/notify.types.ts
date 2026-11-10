export type NotifyScene = 'match_poster' | 'date_suggestion'

export interface SubscribeMessage {
  openid: string
  templateId: string
  page?: string
  scene: NotifyScene
  data: Record<string, { value: string }>
}

export interface NotifyResult {
  stub: true
  accepted: false
  scene: NotifyScene
  openid: string
  templateId: string
  todo: string
}

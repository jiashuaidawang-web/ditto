export type VerifyStrategyName = 'xuexin' | 'student_card_ocr' | 'edu_email'

export interface VerifyStrategy {
  name: VerifyStrategyName
  /** Returned to the client until the real provider is wired. */
  todo: string
}

export const VERIFY_STRATEGIES: Record<VerifyStrategyName, VerifyStrategy> = {
  xuexin: {
    name: 'xuexin',
    todo: 'TODO(xuexin): 学信网在线验证码核验未接入。接入点：学信网/CHSI 学信档案在线验证报告（chsi.com.cn 验证码），核验学校、层次、学历状态后写 StudentVerification.status=verified。',
  },
  student_card_ocr: {
    name: 'student_card_ocr',
    todo: 'TODO(student-card-ocr): 学生证照片 OCR 未接入。接入点：上传至对象存储后调用腾讯云 OCR 或阿里云 OCR，人工抽检学校名与姓名，再写 verified。',
  },
  edu_email: {
    name: 'edu_email',
    todo: 'TODO(edu-email): 教育邮箱验证信未发送。接入点：校验 .edu / .edu.cn 域名后发一次性链接，点击后写 verified。',
  },
}

const EDU_EMAIL = /@([a-z0-9-]+\.)*edu(\.cn)?$/i

export function isEduEmail(email: string): boolean {
  return EDU_EMAIL.test(email.trim())
}

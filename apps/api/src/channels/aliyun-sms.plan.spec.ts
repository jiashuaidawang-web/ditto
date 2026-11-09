import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { interpretAliyunBody, percentEncode, planSms, signRpc } from './aliyun-sms'

const keys = {
  smsProvider: 'aliyun',
  accessKeyId: 'test-id',
  accessKeySecret: 'test-secret',
  signName: '不如见一面',
  templateOtp: 'SMS_OTP',
  templateMatch: 'SMS_MATCH',
}

describe('Aliyun SMS plan', () => {
  it('percent-encodes Aliyun reserved characters', () => {
    assert.equal(percentEncode('a b*~'), 'a%20b%2A~')
  })

  it('signs the same payload the same way', () => {
    const params = { Action: 'SendSms', Format: 'JSON', PhoneNumbers: '13800001001' }
    assert.equal(signRpc(params, 'secret'), signRpc(params, 'secret'))
    assert.notEqual(signRpc(params, 'secret'), signRpc(params, 'other'))
  })

  it('stays on the stub when the provider is stub or keys are missing', () => {
    assert.equal(planSms({ smsProvider: 'stub' }, 'otp', { code: '123456' }).mode, 'stub')
    const missing = planSms({ smsProvider: 'aliyun', accessKeyId: 'only-id' }, 'match', { content: 'hi', url: 'https://aiditto.cn/m/x' })
    assert.equal(missing.mode, 'stub')
    assert.match(missing.reason, /keys missing/)
  })

  it('uses code for OTP and content+url for the match template', () => {
    const otp = planSms(keys, 'otp', { code: '654321' })
    assert.equal(otp.mode, 'aliyun')
    assert.deepEqual(otp.templateParams, { code: '654321' })
    assert.equal(otp.templateCode, 'SMS_OTP')

    const match = planSms(keys, 'match', { content: '和林夏见面', url: 'https://aiditto.cn/m/abc' })
    assert.equal(match.reusedOtpTemplate, false)
    assert.deepEqual(match.templateParams, { content: '和林夏见面', url: 'https://aiditto.cn/m/abc' })
    assert.equal(match.templateCode, 'SMS_MATCH')
  })

  it('reuses the OTP template variable code when the match template is absent', () => {
    const plan = planSms({ ...keys, templateMatch: '' }, 'match', {
      content: '同校见面',
      url: 'https://aiditto.cn/m/abc',
    })
    assert.equal(plan.mode, 'aliyun')
    assert.equal(plan.reusedOtpTemplate, true)
    assert.equal(plan.templateCode, 'SMS_OTP')
    assert.equal(plan.templateParams.code, '同校见面 https://aiditto.cn/m/abc')
  })

  it('treats only Aliyun Code OK as accepted', () => {
    assert.equal(interpretAliyunBody({ Code: 'OK', Message: 'OK', BizId: '1' }).accepted, true)
    assert.equal(interpretAliyunBody({ Code: 'isv.BUSINESS_LIMIT_CONTROL', Message: '限流' }).accepted, false)
    assert.equal(interpretAliyunBody({}).accepted, false)
  })
})

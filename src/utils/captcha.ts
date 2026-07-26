const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CAPTCHA_LENGTH = 5

export function generateCaptchaCode(): string {
  let code = ''
  for (let index = 0; index < CAPTCHA_LENGTH; index += 1) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]
  }
  return code
}

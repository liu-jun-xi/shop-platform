const WEAK_SUFFIXES = ['12345678', '1234567', '123456789'];
const WEAK_PATTERN = new RegExp(`^[a-zA-Z](${WEAK_SUFFIXES.join('|')})$`);
export const BUYER_PASSWORD_SIMPLE_MSG = '密码过于简单，请重新设置！';

export function validateBuyerPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
  }
  if (password.length < 8) {
    throw new Error('密码须至少8位，且同时包含字母和数字');
  }
  if (/^\d+$/.test(password)) {
    throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error('密码须至少8位，且同时包含字母和数字');
  }
  if (WEAK_PATTERN.test(password)) {
    throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
  }
}

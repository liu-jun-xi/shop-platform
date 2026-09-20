export function assertPasswordMatch(newPassword, confirmPassword) {
  if (!newPassword || !confirmPassword) {
    throw new Error('请填写完整密码信息');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('两次输入的新密码不一致');
  }
}

/** 从买家资料生成下单/结账表单初始值 */
export function shippingFormFromBuyer(buyer) {
  if (!buyer) {
    return { contact_email: '', contact_name: '', address: '', phone: '' };
  }
  return {
    contact_email: buyer.default_contact_email || buyer.email || '',
    contact_name: buyer.default_contact_name || '',
    address: buyer.default_address || '',
    phone: buyer.default_phone || ''
  };
}

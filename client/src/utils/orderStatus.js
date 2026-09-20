export function orderStatusLabel(o) {
  if (o.status === 'cancelled') return '已取消';
  if (o.return_status === 'pending') return '退货审核中';
  if (o.return_status === 'approved') return '退货已通过';
  if (o.return_status === 'rejected') return '退货已拒绝';
  if (o.status === 'pending') return '待发货';
  if (o.status === 'shipped') return '已发货';
  if (o.status === 'completed') return '已完成';
  return o.status;
}

export function orderStatusClass(o) {
  if (o.status === 'cancelled') return 'cancelled';
  if (o.return_status === 'pending') return 'return-pending';
  if (o.status === 'completed') return 'completed';
  if (o.status === 'shipped') return 'shipped';
  return o.status;
}

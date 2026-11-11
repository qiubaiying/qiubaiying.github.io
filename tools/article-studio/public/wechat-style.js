// The WeChat editor accepts physical alignment values more consistently than
// browser-computed logical values such as `start` and `end`.
export function wechatTextAlign(value, direction = 'ltr') {
  const align = String(value || '').trim().toLowerCase();
  if (align === 'start' || align === 'match-parent') return direction === 'rtl' ? 'right' : 'left';
  if (align === 'end') return direction === 'rtl' ? 'left' : 'right';
  return ['left', 'right', 'center', 'justify'].includes(align) ? align : 'left';
}

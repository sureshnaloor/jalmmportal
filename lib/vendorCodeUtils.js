export function vendorCodeVariants(vendorcode) {
  const trimmed = String(vendorcode ?? '').replace(/\s+/g, '');
  const variants = new Set([String(vendorcode ?? '').trim(), trimmed]);
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isNaN(n)) {
      variants.add(n);
      variants.add(String(n));
    }
  }
  return [...variants].filter(Boolean);
}

export function vendorCodeHyphenFilter(vendorcode) {
  const list = vendorCodeVariants(vendorcode);
  if (list.length === 1) return { 'vendor-code': list[0] };
  return { $or: list.map((c) => ({ 'vendor-code': c })) };
}

export function vendorCodeLowerFilter(vendorcode) {
  const list = vendorCodeVariants(vendorcode);
  if (list.length === 1) return { vendorcode: list[0] };
  return { $or: list.map((c) => ({ vendorcode: c })) };
}

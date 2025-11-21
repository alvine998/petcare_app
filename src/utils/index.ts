export function toRupiah(value: number): string {
  if (isNaN(value)) return "Rp0";
  return 'Rp' + value
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

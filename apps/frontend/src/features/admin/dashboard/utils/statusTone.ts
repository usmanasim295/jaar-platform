export const getStatusTone = (status: string) => {
  if (status.toLowerCase() === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (status.toLowerCase() === 'blocked') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

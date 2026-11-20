import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { apiErrorMessage, initials } from '../../services/academyApi';

/** Renders a spinner / error / empty message, or nothing when data is ready. */
export const QueryState = ({
  isLoading,
  error,
  isEmpty,
  emptyText = 'Belum ada data.',
}: {
  isLoading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyText?: string;
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm font-medium">Memuat...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
        <AlertCircle size={18} />
        {apiErrorMessage(error, 'Gagal memuat data.')}
      </div>
    );
  }
  if (isEmpty) {
    return <p className="py-10 text-center text-sm text-gray-400 font-medium">{emptyText}</p>;
  }
  return null;
};

export const Avatar = ({
  name,
  src,
  className = 'w-10 h-10 rounded-xl text-sm',
}: {
  name?: string | null;
  src?: string | null;
  className?: string;
}) => (
  <div className={`${className} bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center overflow-hidden shrink-0`}>
    {src ? <img src={src} alt={name ?? ''} className="w-full h-full object-cover" /> : initials(name)}
  </div>
);

export const SESSION_STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

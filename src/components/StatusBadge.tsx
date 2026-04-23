import { publicationStatusCopy } from '../content/pt';

export function StatusBadge({
  status,
}: {
  status: 'publishable' | 'limited' | 'blocked';
}) {
  const copy = publicationStatusCopy[status];

  return (
    <span className={`status-badge status-badge--${status}`} title={copy.description}>
      {copy.label}
    </span>
  );
}

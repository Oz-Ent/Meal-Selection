import { Link } from 'react-router-dom';

interface IAuthLinkProps {
  text: string;
  onClick: () => void;
  style?: React.CSSProperties;
  to?: string;
  className?: string;
}

const baseClassName =
  'bg-transparent flex flex-col items-center justify-center text-primary hover:text-primary-hover font-medium p-0 m-0 transition-colors';

// Internal SPA routes are navigated via react-router to avoid full page reloads.
const isInternalRoute = (to?: string): to is string => !!to && to.startsWith('/');

// Blocks javascript:/data: and other dangerous URI schemes from reaching href.
function getSafeHref(to?: string): string | undefined {
  if (!to) return undefined;
  if (/^(#|\.\/|\.\.\/)/.test(to)) return to;
  try {
    const { protocol } = new URL(to, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(protocol) ? to : undefined;
  } catch {
    return undefined;
  }
}

function AuthLink({ text, onClick, style, to, className }: IAuthLinkProps) {
  const mergedStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    ...style,
  };
  const classes = `${baseClassName} ${className || ''}`;

  if (isInternalRoute(to)) {
    return (
      <Link to={to} onClick={onClick} className={classes} style={mergedStyle}>
        {text}
      </Link>
    );
  }

  return (
    <a onClick={onClick} className={classes} style={mergedStyle} href={getSafeHref(to)}>
      {text}
    </a>
  );
}

export default AuthLink;
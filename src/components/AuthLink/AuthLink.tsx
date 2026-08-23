interface IAuthLinkProps {
  text: string;
  onClick: ()=> void;
  style?: React.CSSProperties;
  to ?: string;
  className?: string;
}



function AuthLink({ text, onClick, style, to, className }: IAuthLinkProps) {
  return (
    <a
      onClick={onClick}
      className={`bg-transparent flex flex-col items-center justify-center text-primary hover:text-primary-hover font-medium p-0 m-0 transition-colors ${className || ''}`}
      style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", ...style }}
      href={to}
    >
      {text}
    </a>
  );
}
export default AuthLink;
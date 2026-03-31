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
      className={`bg-transparent text-cyan-600 p-0 m-0 hover:opacity-80 ${className || ''}`}
      style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", ...style }}
      href={to}
    >
      {text}
    </a>
  );
}
export default AuthLink;
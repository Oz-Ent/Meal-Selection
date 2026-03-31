interface IButtonProps {
  text: string;
  onClick: ()=> void;
  style?: React.CSSProperties;
  className?: string;
  type?: "primary" | "secondary";
}


function Button({ text, onClick, style, className, type = "primary" }: IButtonProps) {
  return (
    <button className={`btn ${type} ${className || ''}`} onClick={onClick} style={style}>
      {text}
    </button>
  ); 
}

export default Button; 
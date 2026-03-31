import googleicon from "../assets/devicon_google.svg"; 

interface IGoogleButtonProps {
  style?: React.CSSProperties;
  onClick: () => void;
}


function GoogleButton({  style,onClick }: IGoogleButtonProps) {
  return (
    <button className="flex items-center justify-center gap-3 border rounded-md py-2" style={style} onClick={onClick}>

      <img
        src={googleicon}
        alt="Google"
        className="w-5 h-5"
      />

      Continue with Google

    </button>
  );
}

export default GoogleButton;
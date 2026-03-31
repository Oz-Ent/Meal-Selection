interface IDividerProps {
  label?: string;
}


function Divider({label}: IDividerProps) {
  return (
    <div className="flex items-center gap-3 text-gray-400 text-sm">

      <div className="flex-1 h-px bg-gray-300" />

     {label && <span>{label}</span>}

      <div className="flex-1 h-px bg-gray-300" />

    </div>
  );
}

export default Divider;
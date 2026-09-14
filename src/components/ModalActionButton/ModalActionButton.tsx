import Button from "../Button/Button";

export default function ModalActionButton({label, onClick, icon}: any) {
    return(
        <Button
            variant="tertiary"
            fullWidth
            onClick={onClick}
            className="flex flex-row justify-between items-center w-full h-full py-4"
        >
            <p className="text-left flex-1">{label}</p>
            {icon}
        </Button>
    )
}

import type React from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Check from "../../assets/Check.svg";
import Exclamation from "../../assets/Exclamation.svg";

type StatusType = "success" | "error";

interface StatusModalProps {
    isOpen: boolean;
    status: StatusType;
    title?: string;
    message: string;
    onClose: () => void;
    showCloseButton?: boolean;
    primaryActionLabel?: string;
    onPrimaryActionClick?: () => void;
    secondaryActionLabel?: string;
    onSecondaryActionClick?: () => void;
    children?: React.ReactNode;
}

export default function StatusModal({
    isOpen,
    status,
    title,
    message,
    onClose,
    showCloseButton = false,
    primaryActionLabel,
    onPrimaryActionClick,
    secondaryActionLabel,
    onSecondaryActionClick,
    children
}: StatusModalProps) {
    const isSuccess = status === "success";
    const icon = isSuccess ? Check : Exclamation;
    const iconAlt = isSuccess ? "Success" : "Error";

    const handlePrimaryAction = () => {
        if (onPrimaryActionClick) {
            onPrimaryActionClick();
            return;
        }
        onClose();
    };

    const handleSecondaryAction = () => {
        if (onSecondaryActionClick) {
            onSecondaryActionClick();
            return;
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            variant="center"
            onClose={onClose}
            showCloseButton={showCloseButton}
        >
            <div className="p-4 flex flex-col items-center justify-center w-55">
                <img src={icon} alt={iconAlt} className="h-12 w-12 mb-4" />
                {title && <h3 className="text-msTextPrimary font-semibold text-base mb-1">{title}</h3>}
                <p className="text-gray-600 text-center">{message}</p>
                {children}
                {(primaryActionLabel || secondaryActionLabel) && (
                    <div className="w-full flex mt-4 space-x-2 items-center justify-center">
                        {secondaryActionLabel && (
                            <div className="h-10 w-full">
                                <Button
                                    variant="outline"
                                    onClick={handleSecondaryAction}
                                    label={secondaryActionLabel}
                                />
                            </div>
                        )}
                        {primaryActionLabel && (
                            <div className="h-10 w-full">
                                <Button
                                    variant="primary"
                                    onClick={handlePrimaryAction}
                                    label={primaryActionLabel}
                                />
                            </div>
                        )}
                        
                    </div>
                )}
            </div>
        </Modal>
    );
}
import Modal from "../../../../components/Modal/Modal";
import Button from "../../../../components/Button/Button";
import { BadgeCheck, BadgeAlert} from "lucide-react";

interface IBottomStatusModal {
  type?: 'success' | 'error';
  message: string;
  onClose: () => void;
  retry: () => void;
}


export function BottomStatusModal({ type = 'success', message, onClose, retry }: IBottomStatusModal) {
  return (
    <Modal isOpen={true} onClose={onClose} variant="bottom">
      <div className="p-4 h-86 flex flex-col items-center">
        {type === 'success' ? <BadgeCheck role="img" className="w-23 h-23 mt-9 text-msGreen" aria-label="Success" /> : <BadgeAlert role="img" className="w-23 h-23 mt-9 text-msError" aria-label="Error" />}
        <p className="text-msTextPrimary mt-2 text-[14px]">{message}</p>
        {type === 'success' && (
          <div className="h-12 mt-auto w-full">
            <Button variant="primary" onClick={onClose} label="Close" />
          </div>
        )}
        {type === 'error' && (
          <div className="w-full mt-auto space-y-2">
            <div className="h-11">
              <Button variant="primary" onClick={retry} label="Try Again" />
            </div>
            <div className="h-11">
              <Button variant="outline" onClick={onClose} label="Close" />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

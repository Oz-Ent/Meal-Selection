import { useRef, useState } from "react";
import Modal from "../../../../components/Modal/Modal";
import Button from "../../../../components/Button/Button";
import { Pencil, Plus } from "lucide-react";
import InputField from "../../../../components/InputField/InputField";
import StatusModal from "../../../../components/StatusModal/StatusModal";
import MealPlaceholder from '../../../../assets/MealPlaceholder.svg';

export interface IAddMealModal {
  mealData?:{id: string, title: string; imageUrl: string }
  onAddMeal: (mealData: { id?: string, title: string; imageUrl: string }) => void;
  isEditMode?: boolean;
  onClose: () => void;
}

export function MealModal({ onAddMeal, onClose, isEditMode = false, mealData }: IAddMealModal) {
  const [name, setName] = useState(mealData?.title || '');
  const [mealImage, setMealImage] = useState<string>(mealData?.imageUrl || MealPlaceholder);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showOptionModal,setShowOptionModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMealImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      {' '}
      <Modal
        isOpen={true}
        onClose={() => {
          if (name.length !== 0 || mealImage !== MealPlaceholder) {
            setStatusModal({
              isOpen: true,
              type: 'error',
              message: 'Are you sure you want to close without saving?',
            });
          } else {
            onClose();
          }
        }}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-2">
          <h2 className="text-msTextPrimary font-semibold text-lg">{isEditMode ? 'Edit Meal' : 'New Meal'}</h2>
          <div className="mt-5">
            <h3 className="text-msTextPrimary font-medium text-[14px] ">Meal Image</h3>
            <div className="relative w-26.25 h-21 my-1 rounded-[10px]">
              <img
                className="w-full h-full object-cover rounded-[10px]"
                alt="Meal Image"
                src={mealImage}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="none"
                className="absolute bottom-0 right-0 p-1 text-white flex items-center justify-center rounded-full bg-msDeepBlue h-7 w-7"
                onClick={() => {
                  if (!isEditMode) {
                     fileInputRef.current?.click();
                     return;
                  }
                  setShowOptionModal(true);
                }}
              >
                {mealImage === MealPlaceholder ? (
                  <Plus className="stroke-current h-5 w-5 text-center " />
                ) : (
                  <Pencil className="stroke-current h-4 w-4 text-center " />
                )}
              </Button>
              {showOptionModal && <div className="absolute top-[65%] -right-33.5 z-10 mt-1 w-40 rounded-lg bg-white shadow-md border border-msListBorder py-2">
                <Button variant="none" className="w-full text-left px-4 py-2 text-sm text-msTextPrimary hover:bg-gray-50 border-b border-msListBorder" onClick={()=>{fileInputRef.current?.click(); setShowOptionModal(false);}}>Change Image</Button>
                <Button variant="none" className="w-full text-left px-4 py-2 text-sm text-msTextPrimary hover:bg-gray-50" onClick={()=>{setMealImage(MealPlaceholder); setShowOptionModal(false);}}>Delete Image</Button>
              </div>}
            </div>
          </div>
          <div className="mt-7">
            {' '}
            <h3 className="text-msTextPrimary font-medium text-[14px] mb-1">Meal Name</h3>
            <div className="h-14 mb-4 mt-2">
              <InputField
                placeholder="Enter name of the meal"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className="mb-4 bg-msTextArea"
                isBorderVisible={false}
                multiline={true}
              />
            </div>
          </div>
          <div className="h-11 mt-4">
            <Button
              variant="primary"
              onClick={() => {
                onAddMeal({ id: mealData?.id, title: name, imageUrl: mealImage });
              }}
              label={isEditMode ? 'Edit Meal' : 'Add New Meal'}
              disabled={name.length === 0}
            />
          </div>
        </div>
      </Modal>
      {statusModal?.isOpen && (
        <StatusModal
          isOpen={statusModal.isOpen}
          status={statusModal.type}
          title={statusModal.type === 'success' ? 'Success' : 'Error'}
          message={statusModal.message}
          onClose={() => setStatusModal(null)}
          primaryActionLabel="Yes"
          onPrimaryActionClick={onClose}
          onSecondaryActionClick={() => setStatusModal(null)}
          secondaryActionLabel="No"
        />
      )}
    </>
  );
}

import { useRef, useState } from 'react';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import InputField from '../../../../components/InputField/InputField';
import StatusModal from '../../../../components/StatusModal/StatusModal';
import { Pencil, Plus } from 'lucide-react';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../../helpers/mealDefaults';
import type { FoodGroup, FoodItem } from '../../../../api/Services/FoodLibraryServices';

export interface MealFormData {
  id?: number;
  name: string;
  imagePath: string | null;
  imageFile?: File | null;
  foodCode: string;
  calories: number | null;
  description: string | null;
}

export interface IAddMealModal {
  mealData?: MealFormData;
  foodItems: FoodItem[];
  onAddMeal: (mealData: MealFormData) => void | Promise<void>;
  isEditMode?: boolean;
  onClose: () => void;
}

const FOOD_CODE_GROUPS: Array<{ group: FoodGroup; label: string }> = [
  { group: 'SUPERGROUP', label: 'Supergroup' },
  { group: 'BASE', label: 'Base' },
  { group: 'PROTEIN', label: 'Protein' },
  { group: 'PREP', label: 'Preparation' },
];

const getInitialSelection = (
  foodCode: string | undefined,
  foodItems: FoodItem[],
  group: FoodGroup,
) => {
  const codeIndex = FOOD_CODE_GROUPS.findIndex((item) => item.group === group);
  const code = foodCode?.split('-')[codeIndex];
  return (
    foodItems.find((item) => item.foodGroup === group && item.foodCode === code)?.foodCode || ''
  );
};

export function MealModal({
  onAddMeal,
  onClose,
  isEditMode = false,
  mealData,
  foodItems,
}: IAddMealModal) {
  const [name, setName] = useState(mealData?.name || '');
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    mealData?.imagePath || FALLBACK_MEAL_IMAGE_URL,
  );
  const [calories, setCalories] = useState(mealData?.calories?.toString() || '');
  const [description, setDescription] = useState(mealData?.description || '');
  const [foodCodes, setFoodCodes] = useState<Record<FoodGroup, string>>({
    SUPERGROUP: getInitialSelection(mealData?.foodCode, foodItems, 'SUPERGROUP'),
    BASE: getInitialSelection(mealData?.foodCode, foodItems, 'BASE'),
    PROTEIN: getInitialSelection(mealData?.foodCode, foodItems, 'PROTEIN'),
    PREP: getInitialSelection(mealData?.foodCode, foodItems, 'PREP'),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const hasChanges = Boolean(name || calories || description || imageFile);
  const foodCode = FOOD_CODE_GROUPS.map(({ group }) => foodCodes[group]).join('-');
  const hasCompleteFoodCode = FOOD_CODE_GROUPS.every(({ group }) => foodCodes[group]);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddMeal({
        id: mealData?.id,
        name: name.trim(),
        foodCode,
        imagePath: mealData?.imagePath ?? null,
        imageFile,
        calories: calories ? Number(calories) : null,
        description: description.trim() || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {' '}
      <Modal
        isOpen={true}
        onClose={() => {
          if (hasChanges) {
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
          <h2 className="text-msTextPrimary font-semibold text-lg">
            {isEditMode ? 'Edit Meal' : 'New Meal'}
          </h2>
          <div className="mt-5">
            <h3 className="text-msTextPrimary font-medium text-[14px] mb-1">Meal Image</h3>
            <div className="relative h-21 w-26.25 rounded-[10px]">
              <img
                className="h-full w-full rounded-[10px] object-cover"
                alt="Meal preview"
                src={imagePreviewUrl}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelection}
              />
              <Button
                variant="none"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-msDeepBlue p-1 text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreviewUrl === FALLBACK_MEAL_IMAGE_URL ? (
                  <Plus className="h-5 w-5" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
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
          <div className="mt-4 grid grid-cols-2 gap-3">
            {FOOD_CODE_GROUPS.map(({ group, label }) => (
              <label
                key={group}
                className="flex flex-col gap-1 text-[14px] font-medium text-msTextPrimary"
              >
                {label}
                <Dropdown
                  ariaLabel={label}
                  value={foodCodes[group]}
                  onChange={(value) =>
                    setFoodCodes((currentCodes) => ({
                      ...currentCodes,
                      [group]: value,
                    }))
                  }
                  placeholder={`Select ${label.toLowerCase()}`}
                  options={foodItems
                    .filter((item) => item.foodGroup === group)
                    .map((item) => ({
                      value: item.foodCode,
                      label: `${item.name} (${item.foodCode})`,
                    }))}
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-msCardSecondaryText">
            Food code: {hasCompleteFoodCode ? foodCode : 'Select all four food groups'}
          </p>
          <div className="mt-4">
            <h3 className="text-msTextPrimary font-medium text-[14px] mb-1">Calories</h3>
            <InputField
              placeholder="Optional"
              value={calories}
              onChange={(event) => setCalories(event.target.value)}
              className="bg-msTextArea"
              isBorderVisible={false}
            />
          </div>
          <div className="mt-4">
            <h3 className="text-msTextPrimary font-medium text-[14px] mb-1">Description</h3>
            <InputField
              placeholder="Optional description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="bg-msTextArea"
              isBorderVisible={false}
              multiline={true}
            />
          </div>
          <div className="h-11 mt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              label={isEditMode ? 'Edit Meal' : 'Add New Meal'}
              disabled={!name.trim() || !hasCompleteFoodCode || isSubmitting}
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

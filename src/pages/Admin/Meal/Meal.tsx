import { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import PresetIllustration from '../../../assets/Preset Illustration.svg';
import BurgerSvg from '../../../assets/admin/BurgeronAdminCard.svg';

import { type Meal as MealRecord } from '../../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import {
  useCreateMealMutation,
  useDeleteMealsMutation,
  useMealsQuery,
  useUpdateMealMutation,
} from '../../../api/useApiQueries';

export function Meal() {
  const mealsQuery = useMealsQuery();
  const createMealMutation = useCreateMealMutation();
  const deleteMealsMutation = useDeleteMealsMutation();

  const [isNewMealModalOpen, setIsNewMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<MealRecord | null>(null);
  const [duplicatingMealId, setDuplicatingMealId] = useState<number | null>(null);

  const [openKebabMealId, setOpenKebabMealId] = useState<number | null>(null);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const rawMeals = Array.isArray(mealsQuery.data?.meals) ? mealsQuery.data.meals : [];
  const meals = rawMeals.filter((m) => m?.isActive);
  const isDuplicating = duplicatingMealId !== null || createMealMutation.isPending;
  const isLoading = mealsQuery.isLoading || isDuplicating;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const handleDuplicateMeal = async (mealToDuplicate: MealRecord) => {
    setOpenKebabMealId(null);
    setDuplicatingMealId(mealToDuplicate.id);
    try {
      const copyName = `Copy_${mealToDuplicate.name}`;
      await createMealMutation.mutateAsync({
        data: {
          name: copyName,
          foodCode: mealToDuplicate.foodCode || `ML-${Date.now().toString().slice(-6)}`,
          calories: mealToDuplicate.calories ?? undefined,
          description: mealToDuplicate.description ?? undefined,
        },
      });
      showToast('success', 'Meal duplicated successfully.');
    } catch {
      showToast('error', 'Something went wrong while duplicating meal. Please try again.');
    } finally {
      setDuplicatingMealId(null);
    }
  };

  const handleDeleteMeal = async () => {
    if (!deletingMeal) return;
    const targetMeal = deletingMeal;
    try {
      await deleteMealsMutation.mutateAsync([targetMeal.id]);
      setDeletingMeal(null);
      showToast('success', 'Meal deleted successfully.');
    } catch {
      setDeletingMeal(null);
      showToast('error', 'Something went wrong while deleting meal. Please try again.');
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="All Meals" backUrl="/admin/activities" />

      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8">
            <LoadingSpinner />
          </div>
          <p className="text-sm text-slate-500">
            {isDuplicating ? 'Duplicating meal...' : 'Loading meals...'}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && meals.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-16 text-center">
          <img
            src={PresetIllustration}
            alt="No meals"
            className="w-56 h-auto max-h-48 object-contain mb-6"
          />
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            There are no preset meals available, click on{' '}
            <span className="font-bold text-slate-900">“add”</span> to create a new preset menu.
          </p>
        </div>
      )}

      {/* MEALS LIST VIEW */}
      {!isLoading && meals.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                onClick={() => setEditingMeal(meal)}
                className="relative flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-2xs cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <img
                    src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                    alt={meal.name}
                    className="h-12 w-12 shrink-0 rounded-2xl object-cover bg-slate-100 shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                      {meal.name}
                    </span>
                    {meal.calories && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {meal.calories} kcal
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label="More options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenKebabMealId(openKebabMealId === meal.id ? null : meal.id);
                    }}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Kebab Options Dropdown Popup */}
                {openKebabMealId === meal.id && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabMealId(null);
                      }}
                    />
                    <div
                      className="absolute right-3 top-12 z-40 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenKebabMealId(null);
                          setEditingMeal(meal);
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Pencil size={15} className="text-slate-500" />
                        <span>Edit meal</span>
                      </button>
                      <button
                        type="button"
                        disabled={duplicatingMealId === meal.id}
                        onClick={() => void handleDuplicateMeal(meal)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left disabled:opacity-50"
                      >
                        {duplicatingMealId === meal.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                        ) : (
                          <Copy size={15} className="text-slate-500" />
                        )}
                        <span>Duplicate meal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenKebabMealId(null);
                          setDeletingMeal(meal);
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                      >
                        <Trash2 size={15} className="text-red-500" />
                        <span>Delete Meal</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={() => setIsNewMealModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-hover px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
      >
        <Plus size={18} />
        <span>Add</span>
      </button>

      {/* NEW MEAL MODAL */}
      {isNewMealModalOpen && (
        <NewMealModalSheet
          onClose={() => setIsNewMealModalOpen(false)}
          onSuccess={() => {
            setIsNewMealModalOpen(false);
            showToast('success', 'Meal created successfully');
          }}
          onError={() => {
            showToast('error', 'Something went wrong while creating meal. Please try again.');
          }}
        />
      )}

      {/* EDIT MEAL MODAL */}
      {editingMeal && (
        <EditMealModalSheet
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSuccess={() => {
            setEditingMeal(null);
            showToast('success', 'Meal changes saved successfully.');
          }}
          onError={() => {
            showToast(
              'error',
              'Something went wrong while saving changes to meal. Please try again.',
            );
          }}
        />
      )}

      {/* DELETE MEAL MODAL */}
      <Modal
        isOpen={Boolean(deletingMeal)}
        onClose={() => !deleteMealsMutation.isPending && setDeletingMeal(null)}
        variant="bottom"
        showCloseButton={!deleteMealsMutation.isPending}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col items-center text-center font-sans w-full">
          <div className="mb-3 flex h-24 w-24 items-center justify-center">
            <img src={BurgerSvg} alt="Delete meal" className="h-full w-full object-contain" />
          </div>
          <h2 className="mb-6 w-full text-left text-base font-bold text-slate-900">Delete menu</h2>
          <button
            type="button"
            disabled={deleteMealsMutation.isPending}
            onClick={() => void handleDeleteMeal()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-50"
          >
            {deleteMealsMutation.isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={18} />
            )}
            <span>Save changes</span>
          </button>
        </section>
      </Modal>

      {/* BOTTOM TOAST */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
}

function NewMealModalSheet({
  onClose,
  onSuccess,
  onError,
}: {
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}) {
  const createMealMutation = useCreateMealMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mealName, setMealName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsImageMenuOpen(false);
  };

  const handleCreateMeal = async () => {
    if (!mealName.trim() || createMealMutation.isPending) return;

    try {
      await createMealMutation.mutateAsync({
        data: {
          name: mealName.trim(),
          foodCode: `ML-${Date.now().toString().slice(-6)}`,
        },
        imageFile: selectedFile,
      });
      onSuccess();
    } catch {
      onError();
    }
  };

  return (
    <Modal isOpen variant="bottom" onClose={onClose} showCloseButton>
      <section className="p-4 pt-6 text-msTextPrimary flex flex-col font-sans w-full relative">
        <h2 className="mb-4 text-base font-bold text-slate-900">New meal</h2>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image Picker Area */}
        <div className="relative mb-4 w-full flex justify-start">
          {!imagePreviewUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-28 w-44 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors"
            >
              <ImageIcon size={36} className="text-slate-300 stroke-[1.5]" />
              <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                <Plus size={14} />
              </div>
            </button>
          ) : (
            <div className="relative h-28 w-44 rounded-2xl overflow-hidden border border-slate-100">
              <img
                src={imagePreviewUrl}
                alt="Meal preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white"
              >
                <Pencil size={14} />
              </button>

              {/* Image Option Menu Popup */}
              {isImageMenuOpen && (
                <div className="absolute bottom-10 right-2 z-30 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImageMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                  >
                    <ImageIcon size={14} />
                    <span>Change image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                  >
                    <X size={14} />
                    <span>Remove Image</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meal Name Input */}
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="Enter meal name"
          className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-6 bg-slate-50/50"
        />

        {/* Submit Button */}
        <button
          type="button"
          disabled={!mealName.trim() || createMealMutation.isPending}
          onClick={() => void handleCreateMeal()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-40"
        >
          {createMealMutation.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Plus size={18} />
          )}
          <span>Create meal</span>
        </button>
      </section>
    </Modal>
  );
}

function EditMealModalSheet({
  meal,
  onClose,
  onSuccess,
  onError,
}: {
  meal: MealRecord;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}) {
  const updateMealMutation = useUpdateMealMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mealName, setMealName] = useState(meal.name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(meal.imagePath || null);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsImageMenuOpen(false);
  };

  const handleSaveMeal = async () => {
    if (!mealName.trim() || updateMealMutation.isPending) return;

    try {
      await updateMealMutation.mutateAsync({
        id: meal.id,
        data: {
          name: mealName.trim(),
          ...(imagePreviewUrl === null ? { imagePath: null } : {}),
        },
        imageFile: selectedFile,
      });
      onSuccess();
    } catch {
      onError();
    }
  };

  return (
    <Modal isOpen variant="bottom" onClose={onClose} showCloseButton>
      <section className="p-4 pt-6 text-msTextPrimary flex flex-col font-sans w-full relative">
        <h2 className="mb-4 text-base font-bold text-slate-900">Edit meal</h2>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image Picker Area */}
        <div className="relative mb-4 w-full flex justify-start">
          {!imagePreviewUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-28 w-44 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors"
            >
              <ImageIcon size={36} className="text-slate-300 stroke-[1.5]" />
              <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-2xs">
                <Plus size={14} />
              </div>
            </button>
          ) : (
            <div className="relative h-28 w-44 rounded-2xl overflow-hidden border border-slate-100">
              <img src={imagePreviewUrl} alt={mealName} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white"
              >
                <Pencil size={14} />
              </button>

              {/* Image Option Menu Popup */}
              {isImageMenuOpen && (
                <div className="absolute bottom-10 right-2 z-30 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImageMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                  >
                    <ImageIcon size={14} />
                    <span>Change image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 text-left font-medium"
                  >
                    <X size={14} />
                    <span>Remove Image</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meal Name Input */}
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="Enter meal name"
          className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-6 bg-slate-50/50"
        />

        {/* Save Changes Button */}
        <button
          type="button"
          disabled={!mealName.trim() || updateMealMutation.isPending}
          onClick={() => void handleSaveMeal()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-40"
        >
          {updateMealMutation.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Check size={18} />
          )}
          <span>Save changes</span>
        </button>
      </section>
    </Modal>
  );
}

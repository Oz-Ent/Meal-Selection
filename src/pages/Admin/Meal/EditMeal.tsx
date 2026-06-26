import { NavLink, useParams } from 'react-router-dom';
import ListCard from '../../../components/ListCard/ListCard';
import { availableMeals } from '../../../helpers/availableMeals';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import EditIcon from '../../../assets/EditIcon.svg';
import Button from '../../../components/Button/Button';
import DeleteIcon from '../../../assets/DeleteIcon.svg';
import { MealModal } from './Modals/MealModal';
import { BottomStatusModal } from './Modals/BottomStatusModal';
import Modal from '../../../components/Modal/Modal';
import StatusModal from '../../../components/StatusModal/StatusModal';

export function EditMeal() {
  const { cardId } = useParams<{ cardId: string }>();
  const [selectedIds, setSelectedIds] = useState<string[]>(cardId ? [cardId] : []);
  const [editMealData, setEditMealData] = useState<{
    id: string;
    title: string;
    imageUrl: string;
  } | null>(null);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [bottomStatusModal, setBottomStatusModal] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen : boolean;
    message : string;
    type : 'success' | 'error';
  }>({
    isOpen : false,
    message : '',
    type : 'success'
  });

  const handleEditMeal = (mealData: { id?: string; title: string; imageUrl: string }) => {
    if (mealData.id) {
      const index = availableMeals.findIndex((meal) => meal.id === mealData.id);
      if (index !== -1) {
        availableMeals[index] = {
          id: mealData.id,
          title: mealData.title,
          imageUrl: mealData.imageUrl,
        };
      }
      setShowEditMealModal(false);
      setEditMealData(null);
      setBottomStatusModal({ type: 'success', message: 'New meal updated successfully' });
    }
  };
  const handleSelectAll = () => {
    setSelectedIds((prevIds) => {
      if (prevIds.length === availableMeals.length) {
        return [];
      }
      return availableMeals.map((meal) => meal.id);
    });
  };

  const handleSelectionChange = (idToToggle: string) => {
    setSelectedIds((prevIds) => {
      if (prevIds.includes(idToToggle)) {
        return prevIds.filter((id) => id !== idToToggle);
      }
      return [...prevIds, idToToggle];
    });
  };

  const handleRemoveMeals = () => {
    const updatedMeals = availableMeals.filter((meal) => !selectedIds.includes(meal.id));
    availableMeals.length = 0;
    availableMeals.push(...updatedMeals);
    setSelectedIds([]);
  };

  const isAllSelected = selectedIds.length === availableMeals.length;

  return (
    <div>
      <nav className="mx-4 my-3 py-1 border-b border-msListBorder min-h-10">
        <section className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/admin/meal">
              <ArrowLeft className="text-msDeepBlue" />
            </NavLink>
            <span className="text-lg text-msDeepBlue leading-snug">
              {selectedIds.length !== 0 ? `${selectedIds.length}` : ''}
            </span>
          </div>
          <div className="flex items-center cursor-pointer gap-6">
            <Button
              variant="none"
              disabled={selectedIds.length === 0 || selectedIds.length > 1}
              className="cursor-pointer"
              onClick={() => {
                setShowEditMealModal(true);
                setEditMealData(
                  availableMeals.find((meal) => meal.id === selectedIds[0]) || null,
                );
              }}
            >
              <img
                src={EditIcon}
                className="stroke-msDeepBlue h-4.5 w-4.5"
              />
            </Button>
            <Button 
              variant="none" 
              disabled={selectedIds.length === 0} 
              className="cursor-pointer"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <img src={DeleteIcon} className="stroke-msDeepBlue h-4.5 w-4.5" />
            </Button>
          </div>
        </section>
        <section className="pl-6 pt-3 flex items-center cursor-pointer" onClick={handleSelectAll}>
          <input
            type="checkbox"
            className="accent-msDeepBlue w-4 h-4 pointer-events-none"
            checked={isAllSelected}
            readOnly
          />
          <span className="pl-3">Select All</span>
        </section>
      </nav>
      {availableMeals.length > 0 &&
        availableMeals.map((meal) => (
          <ListCard
            id={meal.id}
            inputType="checkbox"
            key={meal.id}
            title={meal.title}
            imageUrl={meal.imageUrl}
            selectedValue={selectedIds}
            onChange={(id) => handleSelectionChange(id)}
            highlightedColor="bg-msHighlightBlue"
          />
        ))}
      {showEditMealModal && (
        <MealModal
          onAddMeal={handleEditMeal}
          onClose={() => setShowEditMealModal(false)}
          mealData={editMealData ?? undefined}
          isEditMode={true}
        />
      )}
      {bottomStatusModal && (
              <BottomStatusModal
                type={bottomStatusModal.type}
                message={bottomStatusModal.message}
                onClose={() => setBottomStatusModal(null)}
                retry={() => {}}
              />
            )}
      {isDeleteModalOpen && (
        <DeletModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={() => {
            handleRemoveMeals();
            setIsDeleteModalOpen(false);
            setStatusModal({ isOpen: true, message: 'Meal(s) deleted successfully', type: 'success' });
          }}
        />
      )}
      <StatusModal isOpen={statusModal.isOpen} message={statusModal.message} status={statusModal.type} onClose={() => setStatusModal({ isOpen: false, message: '', type: 'success' })}/>
  </div>
  );
}
interface IDeleteModal{
  isOpen : boolean;
  onClose : () => void;
  onConfirm : () => void;
}
function DeletModal ({isOpen, onClose, onConfirm}: IDeleteModal){
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="font-semibold px-2">Delete Meal</h2>
        <div className="bg-white p-2 text-msTextPrimary">
          <p>Please confirm if you want to delete meal(s). Once deleted, this action can't be undone.</p>
          <div className="flex justify-end mt-4 h-10 gap-4">
            <Button variant="outline" onClick={onClose} label="Cancel"/>
            <Button variant="danger" onClick={onConfirm} label="Confirm"/>
          </div>
        </div>
    </Modal>
  )
}
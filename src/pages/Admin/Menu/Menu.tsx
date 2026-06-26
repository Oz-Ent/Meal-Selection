import { NavBar } from "../../../components/NavBar/NavBar"
import { EmptyPage } from "../../../components/EmptyPage/EmptyPage"
import { useState } from "react"
import Modal from "../../../components/Modal/Modal"
import InputField from "../../../components/InputField/InputField";
import Button from "../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/Card/Card";
import MenuCard  from "../../../assets/MenuCard.svg";
import SelectedMenu from "../../../assets/SelectedMenu.svg";
import StatusModal from "../../../components/StatusModal/StatusModal";


export function Menu() {
    const [addMenu, setAddMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{isMenuSelected: boolean, success: boolean, feedbackMessage: string}>({
        isMenuSelected: false,
        success: false,
        feedbackMessage: ""
    });
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, menuName: string}>({
        isOpen: false,
        menuName: "",
    });
    const menus = JSON.parse(localStorage.getItem("menus") || "{}");

    const handleDeleteMenu=()=>{
        try {
            const updatedMenus = {...menus};
            delete updatedMenus[deleteModal.menuName];
            localStorage.setItem("menus", JSON.stringify(updatedMenus));
            setStatusModal({
                isMenuSelected: true,
                success: true,
                feedbackMessage: "Menu deleted successfully"
            });
        } catch {
            setStatusModal({
                isMenuSelected: true,
                success: false,
                feedbackMessage: "Sorry, couldn't delete menu. Try again."
            });
        }
    }
    
    return <div className="h-full">
        <NavBar title="All Menus" onAddButtonClick={() => { setAddMenu(true) }}  backUrl="/admin/activities"/>
       {Object.keys(menus).length === 0 && <EmptyPage item="menu" />}
        
        {/* Invisible overlay to close dropdown when clicking outside */}
        {openDropdown && (
            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
        )}

        {menus && Object.keys(menus).length > 0 && (
            <div className="p-2">
                {Object.keys(menus).map((menuName) => {
                    const isMenuSelected = selectedMenu === menuName;
                    return (
                    <div key={menuName} className="relative mb-2">
                        <Card 
                            type="menu" 
                            title={menuName} 
                            description="Last used: 19-06-2024" 
                            vertEllipsisIconAction={()=>{
                                setOpenDropdown(menuName);
                            }} 
                            imageUrl={isMenuSelected ? SelectedMenu : MenuCard}
                        />
                        
                        {openDropdown === menuName && (
                            <div className="absolute right-6 top-5 w-56 bg-white rounded-lg shadow-lg z-20 py-2 border border-gray-100">
                                <Button 
                                    className="w-full text-left px-4 py-2.5 text-sm text-msTextPrimary hover:bg-gray-50"
                                    onClick={() => {
                                        if(isMenuSelected){
                                            setSelectedMenu(null);
                                            setStatusModal({
                                                isMenuSelected: true,
                                                success: true,
                                                feedbackMessage: `${menuName} deselected successfully`
                                            })
                                        } else {
                                            setSelectedMenu(menuName);
                                            setStatusModal({
                                                isMenuSelected: true,
                                                success: true,
                                                feedbackMessage: `${menuName} selected successfully`
                                            })

                                        }
                                        setOpenDropdown(null);
                                    }}
                                variant="none"
                                >
                                    {isMenuSelected ? "Deselect menu" : "Select menu for the week"}
                                </Button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Button 
                                    className="w-full text-left px-4 py-2.5 text-sm text-msTextPrimary hover:bg-gray-50"
                                    onClick={() => {
                                        if(isMenuSelected){
                                            setStatusModal({
                                                isMenuSelected: true,
                                                success: false,
                                                feedbackMessage: `${menuName} is currently selected. Please deselect it before deleting.`
                                            })
                                            return;
                                        }
                                        setDeleteModal({isOpen: true, menuName: menuName});
                                        setOpenDropdown(null);
                                    }}
                                variant="none"
                                >Delete menu</Button>
                            </div>
                        )}
                    </div>
                )})} 
            </div>
        )}
        {addMenu && <AddMenuModal onClose={() => setAddMenu(false)}/>}
            {<StatusModal isOpen={statusModal.isMenuSelected} status={statusModal.success ? "success" : "error"} message={statusModal.feedbackMessage} onClose={()=>{setStatusModal({isMenuSelected: false, success: false, feedbackMessage: ""})}}/>}
            {deleteModal.isOpen && <DeleteModal onClose={(confirmed) => {
                if(confirmed){
                    console.log("delete modal confirmed");
                    handleDeleteMenu()
                }
                setDeleteModal({isOpen: false, menuName: ""})
            }}/>}
    </div>
}


function AddMenuModal({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate();
    const [name, setName] = useState("")
    return (
        <Modal isOpen={true} variant="bottom" onClose={onClose}>
            <div className="p-2">
                <h2 className="text-msTextPrimary font-semibold text-lg">New Menu</h2>
               <div className="h-14 my-4">
               <InputField placeholder="Enter name of the menu" value={name} onChange={(e) => { setName(e.target.value) }} className="mb-4 bg-msTextArea" isBorderVisible = {false}/>
               </div>
               <div className="h-11">
                   <Button variant="primary" onClick={() => {
                       navigate(`/admin/menu/add-menu/${encodeURIComponent(name)}`);
                   }} label="Create Menu" disabled={name.length === 0}/>
               </div>
            </div>
        </Modal>
    )
}

function DeleteModal ({onClose}:{onClose: (confirmed: boolean) => void}){
    return (
        <Modal isOpen={true} variant="center" onClose={()=> onClose(false)}>
            <div className="text-msTextPrimary">
                <h2 className =" font-semibold text-lg">Delete Menu</h2>
                <p>Please confirm if you want to delete menu. Once deleted, this action can’t be undone.</p>
                <div className="flex h-11 gap-2 mt-8 mb-4">
                    <Button variant="outline" onClick={() => onClose(false)} label="Cancel"/>
                    <Button variant="danger" onClick={() => onClose(true)} label="Delete"/>
                </div>
            </div>
        </Modal>
    )
}
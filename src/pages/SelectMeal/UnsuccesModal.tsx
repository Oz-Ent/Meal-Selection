import Modal from "../../components/Modal/Modal";
import WarningCuate from "../../assets/warningcuate.svg"
import Button from "../../components/Button/Button";
export function UnsuccessModal() {
    return <Modal isOpen={true} onClose={()=> {}} variant={"bottom"}>
        <div className='flex flex-col items-center text-center h-[85vh] w-full'>
            <img src={WarningCuate} alt="Warning" className="mt-17 mb-3"/>
            <p className="text-[24px] font-semibold pb-3 text-msWarningRed">Unsuccessful</p>
            <p className="text-[16px] px-7">The meals you have chosen for the week were not recorded successfully!!!</p>
            <div className="w-full flex flex-col gap-4 mt-8 px-4 h-28">
                <Button label={"Try Again"} onClick={() => {}} />
                <Button label={"Back To Choose Meals"} variant="outline" onClick={() => {}} />
            </div>
        </div> 
    </Modal>
}
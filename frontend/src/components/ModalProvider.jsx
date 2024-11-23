import { createContext, useContext, useState } from "react";

import { Modal } from "antd";

import { Outlet, useLocation } from 'react-router';

import { CreateProjectForm } from "./Projects/CreateForm.jsx"
import { EditProjectForm } from "./Projects/EditForm.jsx";
import { CreateIssueForm } from "./Issues/CreateForm.jsx"
import { EditIssueForm } from "./Issues/EditForm.jsx";


export const ModalContext = createContext(null);
export const ModalDataContext = createContext(null);


export function ModalProvider() {
    const [modalOpen, setModalOpen] = useState({visible: false, modalId: 0});
    const [modalData, setModalData] = useState(null);

    return (
        <ModalContext.Provider value={[modalOpen, setModalOpen]}>
            <ModalDataContext.Provider value={[modalData, setModalData]}>
                <Outlet />
            </ModalDataContext.Provider>
        </ModalContext.Provider>
    );
}


export function CreateModal({ modalId, data = null }) {
    const location = useLocation();
    const [modalOpen, setModalOpen] = useModalContext();

    let title;
    let modalForm;

    if (location.pathname.includes("issues")) {
        title = "Issue";
        modalId === 1 ? modalForm = <CreateIssueForm /> : modalForm = <EditIssueForm issue={data}/>
    } else {
        title = "Project";
        modalId === 1 ? modalForm = <CreateProjectForm /> : modalForm = <EditProjectForm project={data}/>
    }

    return (
        <Modal
            title={modalId === 1 ? title : title + " details"}
            width={modalId === 1 && 300}
            centered
            open={modalOpen.modalId === modalId &&  modalOpen.visible}
            footer={null}
            focusTriggerAfterClose={false}
            destroyOnClose={true}
            onCancel={() => setModalOpen({visible: false, modalId: modalId})}
        >
            {modalForm}
        </Modal>
    );
}


export const useModalContext = () => useContext(ModalContext);
export const useModalDataContext = () => useContext(ModalDataContext);

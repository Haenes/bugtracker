import { createContext, useContext, useState } from "react";

import { Modal } from "antd";

import { Outlet } from 'react-router';


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


export function CreateModal({ modalId, title, errors = null, children }) {
    const [modalOpen, setModalOpen] = useModalContext();
    let clearErrors;

    title === "Project" ?
        clearErrors = (errors) => {
            delete errors?.createName;
            delete errors?.editName;
            delete errors?.createKey;
            delete errors?.editKey;
        } :
        clearErrors = (errors) => {
            delete errors?.createTitle;
            delete errors?.editTitle;
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
            onCancel={() => {
                setModalOpen({visible: false, modalId: modalId});
                clearErrors(errors);
            }}
        >
            {children}
        </Modal>
    );
}


export const useModalContext = () => useContext(ModalContext);
export const useModalDataContext = () => useContext(ModalDataContext);

import { Modal } from "antd";

import { useOutletContext } from 'react-router';

export function CreateModal({ modalId, title, errors = null, children }) {
    const [modalOpen, setModalOpen] =  useOutletContext();
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
            title={title}
            width={modalId === 1 && 300}
            centered
            open={modalOpen.modalId === modalId && modalOpen.visible}
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

import { Modal } from "antd";

import { useTranslation } from "react-i18next";
import { useOutletContext } from 'react-router';

export function CreateModal({ modalId, title, errors = null, children }) {
    const [modalOpen, setModalOpen] =  useOutletContext();
    const { t } = useTranslation();
    let clearErrors;

    clearErrors = (errors) => {
        if (title === t("projectsList_modalTitle")) {
            delete errors?.createName;
            delete errors?.editName;
            delete errors?.createKey;
            delete errors?.editKey;
        }
        delete errors?.createTitle;
        delete errors?.editTitle;
    };

    return (
        <Modal
            title={title}
            width={modalId === 1 && 290}
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

import { Modal, Spin } from "antd";

import { useTranslation } from "react-i18next";
import { useOutletContext, useNavigation } from 'react-router';


export function CreateModal({ modalId, title, errors = null, children }) {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] =  useOutletContext();
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
            title={modalId != 4 && title}
            width={modalId === 3 ? 315 : 520}
            centered={modalId != 4}
            closable={modalId != 4}
            open={modalOpen.modalId === modalId && modalOpen.visible}
            footer={null}
            focusTriggerAfterClose={false}
            destroyOnClose={true}
            onCancel={() => {
                setModalOpen({visible: false, modalId: modalId});
                clearErrors(errors);
            }}
        >
            <Spin spinning={navigation.state !== "idle"}>
                {children}
            </Spin>
        </Modal>
    );
}

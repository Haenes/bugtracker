import { Modal, Spin } from "antd";

import { useTranslation } from "react-i18next";
import { useOutletContext, useNavigation } from 'react-router';

import { CreateProjectForm } from "./Projects/CreateForm.jsx";
import { EditProjectForm } from "./Projects/EditForm.jsx";
import { CreateIssueForm } from "./Issues/CreateForm.jsx";
import { EditIssueForm } from "./Issues/EditForm.jsx";
import { SearchForm } from "./SearchForm.jsx";
import { ChangePasswordForm } from "./Auth/ChangePasswordForm.jsx";


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
            {children}
        </Modal>
    );
}


export function createModal(id, form, title, errors, item) {
    const navigation = useNavigation();
    const [modalOpen, setModalOpen] =  useOutletContext();

    switch(form) {
        case "search":
            form = <SearchForm setModalOpen={setModalOpen} />;
            break;
        case "changePassword":
            form = <ChangePasswordForm />;
            break;
        case "createProject":
            form = <CreateProjectForm errors={errors} setModalOpen={setModalOpen} />;
            break;
        case "editProject":
            form = <EditProjectForm project={item} errors={errors} setModalOpen={setModalOpen} />;
            break;
        case "createIssue":
            form = <CreateIssueForm errors={errors} setModalOpen={setModalOpen} />;
            break;
        case "editIssue":
            form = <EditIssueForm issue={item} errors={errors} setModalOpen={setModalOpen} />;
    }

    return (
        <CreateModal modalId={id} title={title} errors={errors}>
            <Spin spinning={navigation.state === "submitting"}>
                {form}
            </Spin>
        </CreateModal>
    );
}

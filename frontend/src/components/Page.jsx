import { useState, createContext } from "react"

import { Layout, Modal } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"
import { UpdateProjectForm } from "./CreateProjectForm.jsx"
import { UpdateIssueForm } from "./CreateIssueForm.jsx"


export const ModalContext = createContext(null);
export const ModalDataContext = createContext(null);


export function Page({ header, modalTitle, modalForm, children }) {
    const [modalOpen, setModalOpen] = useState({visible: false, modalId: 0});
    const [modalData, setModalData] = useState(null);

    // TODO: MOVE ALL Context, States and Modals into separate component
    return (
        <Layout hasSider>
            <Sidebar />

            <ModalContext.Provider value={setModalOpen}>
                <ModalDataContext.Provider value={setModalData}>
                    <PageContent header={header}>
                        <Modal
                            title={modalTitle}
                            centered
                            width={300}
                            open={modalOpen.modalId === 1 &&  modalOpen.visible}
                            footer={null}
                            focusTriggerAfterClose={false}
                            destroyOnClose={true}
                            onCancel={() => setModalOpen({visible: false, modalId: 1})}
                        >
                            {modalForm}
                        </Modal>

                        <Modal
                            title="Project details"
                            centered
                            open={modalOpen.modalId === 2 &&  modalOpen.visible}
                            footer={null}
                            focusTriggerAfterClose={false}
                            destroyOnClose={true}
                            onCancel={() => setModalOpen({visible: false, modalId: 2})}
                        >
                            <UpdateProjectForm project={modalData} />
                        </Modal>

                        <Modal
                            title="Issue details"
                            centered
                            open={modalOpen.modalId === 3 &&  modalOpen.visible}
                            footer={null}
                            focusTriggerAfterClose={false}
                            destroyOnClose={true}
                            onCancel={() => setModalOpen({visible: false, modalId: 3})}
                        >
                            <UpdateIssueForm issue={modalData} />
                        </Modal>

                        {children}
                    </PageContent>
                </ModalDataContext.Provider>
            </ModalContext.Provider>

        </Layout>
    );
}

import { useState, createContext } from "react"

import { Layout, Modal } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"
import { UpdateProjectForm } from "./CreateProjectForm.jsx"

// TODO: UPPERCASE FIRST LETTTERS
export const testContext = createContext(null);
export const modalDataContext = createContext(null);


export function Page({ header, modalTitle, modalForm, children }) {
    const [modalOpen, setModalOpen] = useState({visible: false, modalId: 0});
    const [modalData, setModalData] = useState(null);
    console.log(modalOpen)

    // TODO: MOVE ALL Context, States and Modals into separate component? 
    return (
        <Layout hasSider>
            <Sidebar />

            <testContext.Provider value={setModalOpen}>
                <modalDataContext.Provider value={setModalData}>
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
                            width={300}
                            open={modalOpen.modalId === 2 &&  modalOpen.visible}
                            footer={null}
                            focusTriggerAfterClose={false}
                            destroyOnClose={true}
                            onCancel={() => setModalOpen({visible: false, modalId: 2})}
                        >
                            <UpdateProjectForm project={modalData} />
                        </Modal>

                        {children}
                    </PageContent>
                </modalDataContext.Provider>
            </testContext.Provider>

        </Layout>
    );
}

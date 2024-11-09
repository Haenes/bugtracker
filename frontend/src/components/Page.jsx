import { useState } from "react"

import { Layout, Modal } from "antd"

import { Sidebar } from "./Sidebar.jsx"
import { PageContent } from "./PageContent.jsx"


export function Page({ header, modalForm, children }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Layout hasSider>
            <Sidebar />

            <PageContent header={header} handleClick={() => setModalOpen(true)}>
                <Modal
                    title="Create project"
                    centered
                    width={300}
                    open={modalOpen}
                    footer={null}
                    destroyOnClose={true}
                    onCancel={() => setModalOpen(false)}
                >
                    {modalForm}
                </Modal>

                {children}
            </PageContent>
        </Layout>
    );
}

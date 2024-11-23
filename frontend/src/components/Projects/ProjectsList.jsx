import { Link, useLoaderData, useSubmit } from "react-router";

import { List, Card, Button } from "antd";
import { StarFilled, StarOutlined, SettingOutlined } from "@ant-design/icons";

import { useModalContext, useModalDataContext } from "../ModalProvider.jsx";


export function ProjectsList() {
    const projects = useLoaderData();
    const submit = useSubmit();
    const [modalOpen, setModalOpen] = useModalContext();
    const [modalData, setModalData] = useModalDataContext();

    if (!projects) return "You don't have any project yet!"

    const paginationParams = {
        current: projects.page,
        total: projects.count,
        position: "bottom",
        align: "center",
        showSizeChanger: false,
        simple: true,
        hideOnSinglePage: true,
        onChange: (page, pageSize) => submit(`?page=${page}&limit=${pageSize}`)
    }

    return (
        <List
            grid={listGrid}
            pagination={paginationParams}
            dataSource={projects.results}
            renderItem={(item) => {
                return (
                    <List.Item>
                        <Card
                            title={<Link to={`${item.id}/issues`}>{item.name}</Link>}
                            hoverable
                            actions={[
                                <FavoriteButton starred={item.starred} />,
                                <SettingsButton
                                    project={{...item}}
                                    setModalFuncs={[setModalOpen, setModalData]}
                                />
                            ]}
                        >
                            <div className="flex flex-col">
                                <i>KEY: {item.key}</i>
                                <i>TYPE: {item.type}</i>
                            </div>
                        </Card>
                    </List.Item>
                );
            }}
        />
    );
}


function FavoriteButton(starred) {
    return (
        <Button
            htmlType="submit"
            name="starred"
            value={starred.starred}
            className="border-0 shadow-none"
            icon={isFavorite(starred.starred)}
        />
    );
}


function SettingsButton({ project, setModalFuncs }) {
    const [setModalOpen, setModalData] = setModalFuncs;

    return (
        <Button
            title="Settings"
            className="border-0 shadow-none"
            icon={<SettingOutlined style={buttonSize}/>}
            onClick={() => {
                setModalOpen({visible: true, modalId: 2});
                setModalData(project)
            }}
        />
    );
}


function isFavorite(bool) {
    return bool ?
        <StarFilled title="Remove from favorites" style={buttonSize}/> :
        <StarOutlined title="Add to favorites" style={buttonSize}/>
}


const listGrid = {
    gutter: 10,
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 4,
};

const buttonSize = {fontSize: 18};

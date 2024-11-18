import { useContext } from "react";

import { Link, useLoaderData, useSubmit } from "react-router-dom";

import { List, Card, Button } from "antd";
import { StarFilled, StarOutlined, SettingOutlined } from "@ant-design/icons";

import { testContext, modalDataContext } from "./Page";


export function ProjectsList() {
    const projects = useLoaderData();
    const submit = useSubmit();
    const handleClickModal = useContext(testContext);
    const setModalData = useContext(modalDataContext);

    if (!projects) return "You don't have any project yet!"

    const listData = Array.from(projects.results).map((_, i) => ({
        id: projects.results[i].id,
        starred: projects.results[i].starred,
        key: projects.results[i].key,
        name: projects.results[i].name,
        type: projects.results[i].type, 
        created: convertDate(projects.results[i].created)
    }));

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
            dataSource={listData}
            renderItem={(item) => (
            <List.Item>
                    <Card
                        title={<Link to={`${item.id}/issues`}>{item.name}</Link>}
                        hoverable
                        actions={[
                            FavoriteButton(item),
                            <SettingsButton
                                handleClickModal={handleClickModal}
                                setModalData={setModalData}
                                project_d={[
                                    item.id, item.name, item.key,
                                    item.type, item.starred, item.created
                                ]}
                            />
                        ]}
                    >
                        <div className="flex flex-col">
                            <i>KEY: {item.key}</i> 
                            <i>TYPE: {item.type}</i>
                            <i>DATE: {item.created}</i>
                        </div>
                    </Card>
            </List.Item>
            )}
        />
    );
}


function convertDate(date) {
    const dateObj = new Date(Date.parse(date));
    const dateFormat = new Intl.DateTimeFormat(
        ["ru-RU", "en-US"],
        {dateStyle: "short", timeStyle: "medium"}
    )

    return dateFormat.format(dateObj);
}


function FavoriteButton(project) {
    return (
        <Button
            htmlType="submit"
            name="starred"
            value={project.starred}
            className="border-0 shadow-none"
            icon={isFavorite(project.starred)}
        />
    );
}


const buttonSize = {fontSize: 18}


function SettingsButton({ handleClickModal, setModalData, project_d }) {
    const project = {
        id: project_d[0],
        name: project_d[1],
        key: project_d[2],
        type: project_d[3],
        starred: project_d[4],
        created: project_d[5]
    };

    return (
        <Button
            name="settings"
            className="border-0"
            icon={<SettingOutlined style={buttonSize}/>}
            onClick={() => {
                handleClickModal({visible: true, modalId: 2});
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

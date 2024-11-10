import { Link, useLoaderData, useSubmit } from "react-router-dom";

import { List, Card, Button } from "antd";
import { StarFilled, StarOutlined, DeleteOutlined } from "@ant-design/icons";


export function ProjectsList() {
    const projects = useLoaderData();
    const submit = useSubmit();

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
                <Link to={`${item.id}/issues`}>
                    <Card
                        title={item.name}
                        hoverable
                        actions={[
                            FavoriteButton(item),
                            DeleteButton()
                        ]}
                    >
                        <div className="flex flex-col">
                            <i>KEY: {item.key}</i> 
                            <i>TYPE: {item.type}</i>
                            <i>DATE: {item.created}</i>
                        </div>
                    </Card>
                </Link>
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
            value={!project.starred}
            className="border-0 shadow-none"
            icon={isFavorite(project.starred)}
        />
    );
}


const buttonSize = {fontSize: 18}


/**
 * At the moment, this button is a dummy, it's not a fact
 * that in the future it won't be replaced with another one.
 * @returns {Button}
 */
function DeleteButton() {
    return (
        <Button
            name="starred"
            className="border-0"
            icon={<DeleteOutlined style={buttonSize}/>}
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

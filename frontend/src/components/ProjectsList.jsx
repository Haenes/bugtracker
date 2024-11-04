import { useLoaderData } from "react-router-dom";

import { List, Card } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";


export function ProjectsList() {
  const projects = useLoaderData();
  console.log(projects);

  const listData = Array.from(projects.results).map((_, i) => ({
    starred: isFavorite(projects.results[i].starred),
    key: projects.results[i].key,
    name: projects.results[i].name,
    type: projects.results[i].type, 
    created: convertDate(projects.results[i].created)
  }));

  const paginationParams = {
    total: projects.count,
    // current: projects.page,
    position:"bottom",
    align:"center",
    showSizeChanger: false,
    simple: true,
    hideOnSinglePage: true,
    className: "items-bottom"
    // onChange: pass
  }

  return (
    <List
      grid={listGrid}
      pagination={paginationParams}
      dataSource={listData}
      renderItem={(item) => (
        <List.Item>
          <Card title={item.name} hoverable={true}>
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

  return dateFormat.format(dateObj)
}

function isFavorite(bool) {
  if (bool) return <StarFilled style={{fontSize: 20, color: "#f8fc02"}}/>
  else return <StarOutlined style={{fontSize: 20}}/>
}


const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  xxl: 4,
};

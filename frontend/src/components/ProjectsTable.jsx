import { Table } from 'antd';


const columns = [
  {
    title: 'Name',
    dataIndex: 'name'
  },
  {
    title: 'Key',
    dataIndex: 'projectKey',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
  {
    title: 'Created',
    dataIndex: 'created',
  },
];

const dataSource = Array
    .from({length: 100,})
    .map((_, i) => ({
        key: i,
        name: `Project name ${i}`,
        projectKey: "TESTING",
        type: "Fullstack",
        created: `2222.00.00 00:00:${i}`,
    }));


export function ProjectsTable() {

  return (
    <Table
        size='small'
        bordered={true}
        columns={columns}
        dataSource={dataSource}
        pagination={{hideOnSinglePage: true, simple: true, showSizeChanger: true}}
        scroll={{y: 55 * 9}}
        title={() => {return "Projects"}}
    />
  );
}

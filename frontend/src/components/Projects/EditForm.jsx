import { useEffect, useState } from "react"

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import {
    Button,
    Checkbox,
    Collapse,
    Empty,
    Table,
    Tabs,
    Select,
    Steps,
    Input,
    Popconfirm
} from 'antd';

import { getProjectUsers, getProjectinvites, searchItems } from "../../client/base.js";
import { convertDate } from "../PageLayout.jsx";

const { TextArea } = Input;


export function EditProjectForm({ project, errors, setModalOpen }) {
    const fetcher = useFetcher();
    const { t } = useTranslation();

    const handleDelete = () => {
        setModalOpen({visible: false, modalId: 2});
        fetcher.submit(
            {intent: "delete", projectId: project.id},
            {method: "DELETE"}
        );
    };

    return (
        <Form method="post" name="editProject">
            {errors?.editName || errors?.editKey ?
                <div className='text-center text-red-500'>
                    {errors?.editName}
                    {errors?.editKey}
                </div> : <></>
            }

            <input name="projectId" value={project.id} type="hidden" />

            <label>{t("name")}</label>
            <Input
                name="name"
                className="mb-3"
                status={errors?.name && "error"}
                type="text"
                defaultValue={project.name}
                required
                minLength={3}
            />

            <label>{t("editProject_key")}</label>
            <Input
                name="key"
                className="mb-3"
                status={errors?.editKey && "error"}
                type="text"
                defaultValue={project.key}
                required
                minLength={3}
                maxLength={10}
            />

            <label>{t("description")}</label>
            <TextArea
                name="description"
                className="mb-3"
                defaultValue={project.description}
                placeholder={t("editEmptyDescription")}
            />

            <label className="mr-2">{t("editProject_favorite")}</label>
            <Checkbox className="mb-3" name="is_favorite" defaultChecked={project.is_favorite} />

            <div className="mb-3">
                <label className="mr-2">{t("editCreated")}</label>
                {convertDate(project.created_at)}
            </div>

            <div className="mb-3">
                <label className="mr-2">{t("editUpdated")}</label>
                {/* Get updated datetime from PATCH response to synchronize data */}
                {errors?.created_at == project.created_at ?
                    convertDate(errors.updated_at) :
                    convertDate(project.updated_at)
                }
            </div>

            <div className="flex flex-row gap-3 justify-end">
                <Popconfirm
                    title={t("confirm_title")}
                    description={t("confirm_description")}
                    cancelText={t("confirm_cancel")}
                    okText={t("confirm_ok")}
                    onConfirm={handleDelete}
                >
                    <Button
                        danger
                        name="intent"
                        value="delete"
                        type="text"
                    >
                        {t("btn_delete")}
                    </Button>
                </Popconfirm>

                <Button name="intent" value="edit" type="primary" htmlType="submit">
                    {t("btn_change")}
                </Button>
            </div>
        </Form>
    );
}


function PickUser({ value, setValue }) {
    const { t } = useTranslation();
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (value) => {
        if (value.length >= 4) {
            setLoading(true);
            const user = await searchItems(value, true);

            if (!user?.detail) {
                setUser([{label: user.first_name, value: user.id}]);
            } else {
                setUser([]);
            }
            setLoading(false);
        }
    };

    return (
        <Select
            loading={loading}
            labelInValue
            showSearch
            className="w-full"
            placeholder={t("inviteUserPlaceholder")}
            value={value}
            onSearch={handleSearch}
            onSelect={setValue}
            defaultActiveFirstOption={false}
            filterOption={false} 
            notFoundContent={t("search_noResults")}
            options={user}
            optionRender={(user) => <>{user.data.label}</>}
        />
    );
}


function ProjectInvites({ projectId, value, setValue }) {
    const { t } = useTranslation();
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateInviteLabel = (inviteToken, role) => {
        return (`
            ${t("projectInvites_token")}: ${inviteToken},
            ${t("projectInvites_role")}: ${role}
        `)
    };

    const fetchInvites = async () => {
        setLoading(true);
        const invites = await getProjectinvites(projectId);

        setInvites(
            invites.map(invite => ({
                label: generateInviteLabel(invite.invite_token, invite.role_id),
                value: invite.invite_token
            }))
        );
        setLoading(false);
    };

    useEffect(() => {fetchInvites()}, [])

    return (
        <Select
            loading={loading}
            labelInValue
            className="w-full"
            placeholder={t("projectInvites")}
            value={value}
            onSelect={setValue}
            options={invites}
            optionRender={(invite) => <>{invite.data.label}</>}
        />
    );
}


function InviteNewUser({ projectId, t }) {
    const fetcher = useFetcher();
    const [current, setCurrent] = useState(0);
    const [userValue, setUserValue] = useState();
    const [inviteValue, setInviteValue] = useState();

    const inviteUser = () => {
        fetcher.submit(
            {
                intent: "inviteUser",
                projectId: projectId,
                userId: userValue.value,
                firstName: userValue.label,
                inviteToken: inviteValue.value
            },
            {method: "POST"}
        );
        setUserValue();
        setInviteValue();
    };

    const handleChange = (step) => {
        if (step == 1 && !userValue || step == 2 && !inviteValue) {
            return;
        }
        if (step == 2) {
            inviteUser();
        }
        setCurrent(step);
    }

    const steps = [
        {
            title: t("step1"),
            content: <PickUser value={userValue} setValue={setUserValue} />,
        },
        {
            title: t("step2"),
            content: (
                <ProjectInvites
                    projectId={projectId}
                    value={inviteValue}
                    setValue={setInviteValue}
                />
            )
        },
        {
            title: t("step3"),
            content: <div className="text-center">{t("userInvited")}</div>,
        },
    ];
    const stepsItems = steps.map(item => ({key: item.title, title: item.title, status: item.status}));

    const collapseItems = [{
        key: 'collapseItem1',
        label: t("inviteUser"),
        children: (
            <>
                <Steps
                    current={current}
                    items={stepsItems}
                    size="small"
                    onChange={handleChange}
                />
                <div className="mt-3">{steps[current].content}</div>
            </>
        ),
    }];

    return <Collapse items={collapseItems} size="small"/>
}


function ProjectParticipants({ projectId, t }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetcher = useFetcher();
    const ROLES = {
        1: t("userRoleAdmin"),
        2: t("userRolePrivileged"),
        3: t("userRoleDefault"),
    };

    const handleUserEdit = (userId, newRole) => {
        fetcher.submit(
            {
                intent: "editUser",
                projectId: projectId,
                userId: userId,
                roleId: newRole
            },
            {method: "PATCH"}
        );
    };
    const handleUserDelete = (userId) => {
        fetcher.submit(
            {intent: "deleteUser", projectId: projectId, userId: userId},
            {method: "DELETE"}
        );
    };

    const columns = [
        {title: t("username"), dataIndex: "username", key: "username",  align: "center"},
        {
            title: t("role"),
            key: "role",
            align: "center",
            render: (_, user) => (
                <Select
                    defaultValue={ROLES[user.role_id]}
                    options={[
                        {label: ROLES[1], value: 1},
                        {label: ROLES[2], value: 2},
                        {label: ROLES[3], value: 3},
                    ]}
                    onChange={(value) => handleUserEdit(user.user_id, value)}
                />
            )
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (_, user) => (
                <Popconfirm
                    title={t("confirm_title")}
                    description={t("confirm_description")}
                    cancelText={t("confirm_cancel")}
                    okText={t("confirm_ok")}
                    onConfirm={() => handleUserDelete(user.user_id)}
                >
                    <Button danger type="text">
                        {t("btn_delete")}
                    </Button>
                </Popconfirm>
            )
        },
    ]

    const fetchUsers = async () => {
        setLoading(true);
        setUsers(await getProjectUsers(projectId));
        setLoading(false);
    };

    useEffect(() => {fetchUsers()}, [])

    return (
        users.length ?
        <div className="flex flex-col gap-y-4">
            <Table
                bordered
                loading={loading}
                rowClassName={"text-center"}
                columns={columns}
                dataSource={users}
                pagination={false}
                size="small"
            />
            <InviteNewUser projectId={projectId} t={t} />
        </div> :
        <Empty description={t("noUsers")} >
            <InviteNewUser projectId={projectId} t={t} />
        </Empty>
    )
}


export function ProjectSettings({ project, errors, setModalOpen }) {
    const { t } = useTranslation();
    const items = [
        {
            label: t("projectSettingsDetails"),
            key: 1,
            children: <EditProjectForm project={project} errors={errors} setModalOpen={setModalOpen} />
        },
        {
            label: t("projectSettingsParticipants"),
            key: 2,
            children: <ProjectParticipants projectId={project.id} t={t} />
        }
    ];

    return (
        <Tabs
            tabPosition={"top"}
            items={items.map((_, i) => {return items[i]})}
        />
    )
}

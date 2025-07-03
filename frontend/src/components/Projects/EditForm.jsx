import { useEffect, useState } from "react"

import { Form, useFetcher } from "react-router";

import { useTranslation } from "react-i18next";

import {
    Button,
    Checkbox,
    Collapse,
    DatePicker,
    Empty,
    Table,
    Tabs,
    Tooltip,
    Select,
    Steps,
    Input,
    InputNumber,
    Popconfirm
} from 'antd';
import {CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { getProjectUsers, getProjectInvites, searchItems } from "../../client/base.js";
import { getDateTimeFormat } from "../Tasks/DeadlinePicker.jsx";
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

            <label>{t("projectKey")}</label>
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

            <label className="mr-2">{t("projectFavorite")}:</label>
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
                    title={t("confirmTitle")}
                    description={t("confirmDescription")}
                    cancelText={t("confirmCancel")}
                    okText={t("confirmOk")}
                    onConfirm={handleDelete}
                >
                    <Button
                        danger
                        name="intent"
                        value="delete"
                        type="text"
                    >
                        {t("deleteBtn")}
                    </Button>
                </Popconfirm>

                <Button name="intent" value="edit" type="primary" htmlType="submit">
                    {t("changeBtn")}
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
            notFoundContent={t("searchNoResults")}
            options={user}
            optionRender={(user) => <>{user.data.label}</>}
        />
    );
}


function SelectProjectInvites({ projectId, roles, value, setValue }) {
    const { t } = useTranslation();
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);

    const generateInviteLabel = (invite) => {
        invite.max_uses = invite.max_uses || "∞";
        invite.expires_at = invite.expires_at && dayjs(
            new Date(invite.expires_at).toLocaleDateString(),
            'DD-MM-YYYY'
        )

        // The only reason it's not a single string is
        // because of the incorrect tooltip formatting with new lines.
        return (
            `${roles[invite.role_id]}, `
            + `${invite.use_count}/${invite.max_uses}, `
            + `${invite.expires_at ? invite.expires_at.format(getDateTimeFormat()) : "-"}`
        )
    };

    const fetchInvites = async () => {
        setLoading(true);
        const invites = await getProjectInvites(projectId);

        setInvites(
            invites.map(invite => ({
                label: generateInviteLabel(invite),
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
            placeholder={t("projectSettingsInvites")}
            value={value}
            onSelect={setValue}
            options={invites}
        />
    );
}


function InviteNewUser({ projectId, roles, t }) {
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
                <SelectProjectInvites
                    projectId={projectId}
                    roles={roles}
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


function ProjectParticipants({ projectId, roles, setModalOpen }) {
    const { t } = useTranslation();
    const fetcher = useFetcher();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

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
        setModalOpen({visible: false, modalId: 2});
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
                    defaultValue={roles[user.role_id]}
                    options={[
                        {label: roles[1], value: 1},
                        {label: roles[2], value: 2},
                        {label: roles[3], value: 3},
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
                    title={t("confirmTitle")}
                    description={t("confirmDescription")}
                    cancelText={t("confirmCancel")}
                    okText={t("confirmOk")}
                    onConfirm={() => handleUserDelete(user.user_id)}
                >
                    <Button danger type="text">
                        {t("deleteBtn")}
                    </Button>
                </Popconfirm>
            )
        },
    ]

    const fetchUsers = async () => {
        setLoading(true);
        const users = await getProjectUsers(projectId);

        if (users) {
            for (let i in users) {
                users[i].key = users[i].username;
            }
        }

        setUsers(users);
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
            <InviteNewUser projectId={projectId} roles={roles} t={t} />
        </div> :
        <Empty description={t("noUsers")} >
            <InviteNewUser projectId={projectId} roles={roles} t={t} />
        </Empty>
    )
}


function ProjectInvites({ projectId, roles, setModalOpen }) {
    const { t } = useTranslation();
    const fetcher = useFetcher();
    const [invites, setInvites] = useState([]);

    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [role, setRole] = useState(false);
    const [maxUses, setMaxUses] = useState(false);
    const [expiresAt, setExpiresAt] = useState(false);

    const handleInviteEdit = (projectId, inviteId, invite, updateData) => {
        if (
            !updateData.role_id && !updateData.max_uses && !updateData.expires_at ||
            invite.role_id == updateData.role_id &&
            invite.max_uses == updateData.max_uses &&
            invite.expires_at == updateData.expires_at
        ) {
            return console.log("Nothing to change!");
        }
        fetcher.submit(
            {
                intent: "editInvite",
                projectId: projectId,
                inviteId: inviteId,
                updateData: JSON.stringify(updateData)
            },
            {method: "PATCH"}
        );
        setModalOpen({visible: false, modalId: 2});

    };
    const handleInviteDelete = (inviteId) => {
        fetcher.submit(
            {intent: "deleteInvite", projectId: projectId, inviteId: inviteId},
            {method: "DELETE"}
        );
        setModalOpen({visible: false, modalId: 2});
    };

    const columns = [
        {
            title: t("inviteRole"),
            dataIndex: "role_id",
            key: "roleId",
            align: "center",
            render: (_, invite) => (
                !isEdit ? roles[invite.role_id]
                : <SelectRole
                    roles={roles}
                    defaultValue={roles[invite.role_id]}
                    setRole={setRole}
                />
            )
        },
        {
            title: t("inviteMaxUses"),
            dataIndex: "max_uses",
            key: "maxUses",
            align: "center",
            render: (_, invite) => (
                !isEdit ?
                    invite?.max_uses ?
                    `${invite.use_count}/${invite.max_uses}` : `${invite.use_count}/∞`
                : <InputMaxUses invite={invite} setMaxUses={setMaxUses} />

            )
        },
        {
            title: t("inviteExpiresAt"),
            dataIndex: "expires_at",
            key: "expiresAt",
            align: "center",
            render: (_, invite) => (
                !isEdit ?
                    invite?.expires_at ?
                    `${new Date(invite.expires_at).toLocaleString()}` : "-"
                : <ExpiresAtPicker
                    defaultValue={invite.expires_at}
                    setExpiresAt={setExpiresAt}
                />
            )
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (_, invite) => (
                <>
                    {isEdit ?
                        <>
                            <Button
                                color="primary"
                                variant="text"
                                onClick={() => handleInviteEdit(
                                    projectId, invite.id, invite,
                                    {role_id: role, max_uses: maxUses, expires_at: expiresAt}
                                )}
                                icon={<CheckOutlined />}
                            />

                            <Button
                                color="orange"
                                variant="text"
                                onClick={() => {
                                    setRole(false); setMaxUses(false); setExpiresAt(false);
                                    setIsEdit(!isEdit)
                                }}
                                icon={<CloseOutlined />}
                            />
                        </>
                        : <>
                            <Button
                                className="mr-2"
                                icon={<EditOutlined />}
                                onClick={() => setIsEdit(!isEdit)}
                            />

                            <Popconfirm
                                title={t("confirmTitle")}
                                description={t("confirmDescription")}
                                cancelText={t("confirmCancel")}
                                okText={t("confirmOk")}
                                onConfirm={() => handleInviteDelete(invite.id)}
                            >
                                <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </>
                    }
                </>
            )
        },
    ]

    const fetchInvites = async () => {
        setLoading(true);
        const invites = await getProjectInvites(projectId);

        if (invites) {
            for (let i in invites) {
                invites[i].key = invites[i].invite_token;
            }
        }

        setInvites(invites);
        setLoading(false);
    };

    useEffect(() => {fetchInvites()}, [])

    return (
        <div className="flex flex-col gap-y-4">
            {!isCreating ?
                <Button
                    type="primary"
                    className="w-1/4"
                    onClick={() => setIsCreating(!isCreating)}
                >
                    {t("createBtn")}
                </Button>
                : <Form className="flex gap-x-2" method="post" name="editProject">
                    <input name="projectId" value={projectId} type="hidden" />

                    <SelectRole roles={roles} setRole={setRole}/>
                    <input name="role_id" type="hidden" value={role} />

                    <Tooltip title={t("inviteMaxUses")}>
                        <InputMaxUses setMaxUses={setMaxUses} />
                    </Tooltip>

                    <ExpiresAtPicker setExpiresAt={setExpiresAt} />
                    <input name="expires_at" value={expiresAt || ""} type="hidden" />

                    <Button
                        name="intent"
                        value="createInvite"
                        color="primary"
                        variant="text"
                        htmlType="submit"
                        icon={<CheckOutlined />}
                        onClick={() => setModalOpen({visible: false, modalId: 2})}
                    />

                    <Button
                        color="orange"
                        variant="text"
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setRole(false);
                            setMaxUses(false);
                            setExpiresAt(false);
                            setIsCreating(!isCreating);
                        }}
                    />
                </Form>
            }

            <Table
                bordered
                loading={loading}
                rowClassName="text-center"
                columns={columns}
                dataSource={invites}
                pagination={false}
                size="small"
                scroll={{x: 'max-content'}}
            />
        </div>
    )
}

export function ProjectSettings({ project, errors, setModalOpen }) {
    const { t } = useTranslation();
    const ROLES = {
        1: t("userRoleAdmin"),
        2: t("userRolePrivileged"),
        3: t("userRoleDefault"),
    };
    const items = [
        {
            label: t("projectSettingsDetails"),
            key: "tab1",
            children: <EditProjectForm project={project} errors={errors} setModalOpen={setModalOpen} />
        },
        {
            label: t("projectSettingsParticipants"),
            key: "tab2",
            children: <ProjectParticipants projectId={project.id} roles={ROLES} setModalOpen={setModalOpen} />
        },
        {
            label: t("projectSettingsInvites"),
            key: "tab3",
            children: <ProjectInvites projectId={project.id} roles={ROLES} setModalOpen={setModalOpen} />
        }
    ];

    return (
        <Tabs
            tabPosition={"top"}
            items={items.map((_, i) => {return items[i]})}
        />
    )
}


function SelectRole({ roles, defaultValue, setRole }) {
    const { t } = useTranslation();

    return (
        <Select
            defaultValue={defaultValue}
            popupMatchSelectWidth={false}
            placeholder={t("role")}
            options={[
                {label: roles[1], value: 1},
                {label: roles[2], value: 2},
                {label: roles[3], value: 3},
            ]}
            onChange={setRole}
        />
    )
}


function InputMaxUses({ invite, setMaxUses }) {
    const { t } = useTranslation();

    return (
        <InputNumber
            min={invite ? invite.use_count + 1 : 1}
            max={999}
            defaultValue={invite?.max_uses}
            placeholder={invite ? 1 : t("inviteMaxUses")}
            onChange={setMaxUses}
        />
    )
}


function ExpiresAtPicker({ defaultValue, setExpiresAt }) {
    const { t } = useTranslation();

    return (
        <DatePicker
            defaultValue={defaultValue && dayjs(defaultValue)}
            showTime
            showNow={false}
            format={{format: getDateTimeFormat()}}
            placeholder={t("inviteExpiresAt")}
            minDate={dayjs(new Date().toLocaleDateString(), 'DD-MM-YYYY')}
            onChange={(value, dateString) => {
                value && setExpiresAt(value.toISOString())
            }}
        />
    )
}

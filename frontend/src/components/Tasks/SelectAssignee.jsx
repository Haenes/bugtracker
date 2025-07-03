import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Select } from 'antd';

import { getProjectUsers } from "../../client/base.js";


export function SelectAssignee({
    projectId,
    assignee,
    setAssignee,
    status,
    setStatus,
    isCreating = false
}) {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSelect = (assignee) => {
        setAssignee(assignee.value);
        status == 1 && setStatus(2);
    }

    const fetchUsers = async () => {
        setLoading(true);
        const users = await getProjectUsers(projectId, true);
        setUsers(
            users.map(user => ({
                label: `${user.username}`,
                value: user.user_id
            }))
        );
        setLoading(false);
    };
    
    useEffect(() => {fetchUsers()}, [])

    return (
        <>
            {isCreating ? <></> : <div><label>{t("assignee")}</label></div>}
            <Select
                loading={loading}
                labelInValue
                className={isCreating ? "w-1/3" : "w-5/12 mb-3"}
                placeholder={t("assignee")}
                defaultValue={assignee || undefined}
                onSelect={handleSelect}
                options={users}
            />
            <input name="assignee_id" value={assignee || undefined} type="hidden" />
        </>
    )
}

import { DatePicker } from "antd";
import dayjs from 'dayjs';

import { useTranslation } from "react-i18next";


export function DeadlinePicker({
    deadline,
    setDeadline,
    value = undefined,
    isPermitted = true
}) {
    const { t } = useTranslation();

    return (
        <>
            <div>
                <DatePicker
                    defaultValue={value && dayjs(value) || false}
                    disabled={!isPermitted}
                    showTime
                    showNow={false}
                    format={{
                        format: localStorage.getItem("i18nextLng") === "ru" &&
                                'DD-MM-YYYY HH:mm' || 'YYYY-MM-DD HH:mm'
                    }}
                    placeholder={t("deadline")}
                    minDate={dayjs(new Date().toLocaleDateString(), 'DD-MM-YYYY')}
                    onChange={(value, dateString) => {
                        value && setDeadline(value.toISOString())
                    }}
                />
            </div>
            <input name="deadline_at" type="hidden" value={deadline} />
        </>
    )
}

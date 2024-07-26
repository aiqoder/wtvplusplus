
export function handleUserGroup(name: string) {
    const userGroup = localStorage.getItem("create-group-dialog-text") || ""
    if (userGroup) {
        const userGroupLines = userGroup.split("\n")
        for (const userGroupLine of userGroupLines) {
            const [groupName, groupValues] = userGroupLine.split(":")
            if (groupValues) {
                const values = groupValues.split("#")
                for (const value of values) {
                    if (new RegExp(value).test(name)) {
                        return groupName
                    }
                }
            }
        }
    }
    return ""
}
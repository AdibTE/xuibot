import fs from "fs";
export function auditLog(userId, action, meta) {
    const log = {
        time: new Date().toISOString(),
        userId,
        action,
        meta,
    };
    fs.appendFileSync("audit.log", JSON.stringify(log) + "\n");
}

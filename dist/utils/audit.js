"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const fs_1 = __importDefault(require("fs"));
function auditLog(userId, action, meta) {
    const log = {
        time: new Date().toISOString(),
        userId,
        action,
        meta,
    };
    fs_1.default.appendFileSync("audit.log", JSON.stringify(log) + "\n");
}

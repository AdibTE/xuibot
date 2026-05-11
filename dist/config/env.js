"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Missing env variable: ${name}`);
    }
    return value;
}
exports.ENV = {
    BOT_TOKEN: requireEnv("BOT_TOKEN"),
    BOT_PASSWORD: requireEnv("BOT_PASSWORD"),
    PANEL_BASE_URL: requireEnv("PANEL_BASE_URL"),
    PANEL_USERNAME: requireEnv("PANEL_USERNAME"),
    PANEL_PASSWORD: requireEnv("PANEL_PASSWORD"),
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPort = isValidPort;
exports.isValidEmail = isValidEmail;
exports.isPositiveNumber = isPositiveNumber;
function isValidPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isPositiveNumber(n) {
    return Number.isFinite(n) && n >= 0;
}

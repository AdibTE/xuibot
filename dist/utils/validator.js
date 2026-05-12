export function isValidPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isPositiveNumber(n) {
    return Number.isFinite(n) && n >= 0;
}

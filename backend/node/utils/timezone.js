/**
 * Timezone utilities for Argentina (UTC-3)
 * Provides consistent timezone handling across the application
 */

// Argentina timezone offset
const ARGENTINA_OFFSET_MINUTES = -3 * 60; // UTC-3

/**
 * Get current date/time in Argentina timezone (UTC-3)
 * @returns {Date} Current date in Argentina timezone
 */
function getArgentinaTime() {
  const now = new Date();
  return new Date(now.getTime() + ARGENTINA_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Get start of today (00:00:00) in Argentina timezone
 * @returns {Date} Start of today in Argentina
 */
function getStartOfDayArgentina() {
  const argentinaTime = getArgentinaTime();
  const startOfDay = new Date(argentinaTime);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get end of today (23:59:59.999) in Argentina timezone
 * @returns {Date} End of today in Argentina
 */
function getEndOfDayArgentina() {
  const argentinaTime = getArgentinaTime();
  const endOfDay = new Date(argentinaTime);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

/**
 * Convert UTC date to Argentina timezone
 * @param {Date} utcDate - UTC date to convert
 * @returns {Date} Date in Argentina timezone
 */
function toArgentinaTime(utcDate) {
  return new Date(utcDate.getTime() + ARGENTINA_OFFSET_MINUTES * 60 * 1000);
}

/**
 * Get date in YYYY-MM-DD format for Argentina timezone
 * @param {Date} [date] - Optional date, defaults to today in Argentina
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getArgentinaDateString(date = null) {
  const argDate = date ? toArgentinaTime(date) : getArgentinaTime();
  return argDate.toISOString().split('T')[0];
}

/**
 * Check if a date is today in Argentina timezone
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today in Argentina
 */
function isTodayArgentina(date) {
  const todayStr = getArgentinaDateString();
  const dateStr = getArgentinaDateString(date);
  return todayStr === dateStr;
}

module.exports = {
  ARGENTINA_OFFSET_MINUTES,
  getArgentinaTime,
  getStartOfDayArgentina,
  getEndOfDayArgentina,
  toArgentinaTime,
  getArgentinaDateString,
  isTodayArgentina
};

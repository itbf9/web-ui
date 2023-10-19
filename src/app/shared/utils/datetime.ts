export interface DateObject {
  year: string
  month: string
  day: string
  hours: string
  minutes: string
  seconds: string
}

/**
 * Converts a Unix timestamp to a DateObject containing date and time components.
 *
 * @param ts - The Unix timestamp (in seconds) to convert.
 * @returns A DateObject containing the following properties:
 *   - year: The full year (e.g., "2023").
 *   - month: The month (1-12) as a zero-padded string (e.g., "04" for April).
 *   - day: The day of the month as a zero-padded string (e.g., "16").
 *   - hours: The hours in 24-hour format as a zero-padded string (e.g., "09").
 *   - minutes: The minutes as a zero-padded string (e.g., "30").
 *   - seconds: The seconds as a zero-padded string (e.g., "45").
 */
export const dateExplode = (ts: number): DateObject => {
  // Convert the Unix timestamp to milliseconds and create a Date object
  const dateObject = new Date(ts * 1000);
  if (isNaN(dateObject.getTime())) {
    throw Error('Invalid date')
  }

  // Extract date and time components
  const year = dateObject.getFullYear() + '';
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based (0-11)
  const day = dateObject.getDate().toString().padStart(2, '0');
  const hours = dateObject.getHours().toString().padStart(2, '0');
  const minutes = dateObject.getMinutes().toString().padStart(2, '0');
  const seconds = dateObject.getSeconds().toString().padStart(2, '0');

  return { year, month, day, hours, minutes, seconds }
}


/**
 * Converts a Unix timestamp(in seconds) to a custom formatted date and time string.
 *
 * @param { number } ts - The Unix timestamp(in seconds) to convert to a date and time string.
 *
 * @returns { string } - A custom formatted date and time string in the format "YYYY-MM-DD HH:MM:SS",
 * or an empty string if parsing or formatting fails.
 *
 * @example
 * const timestamp = 1634549256; // Unix timestamp in seconds
 * const formattedString = toISOString(timestamp);
 * // Returns a string in the format "2021-10-18 15:34:16"
 */
export const toISOString = (ts: number): string => {
  try {
    if (typeof ts !== "number") {
      throw new Error("Invalid input: ts must be a number.");
    }

    const { year, month, day, hours, minutes, seconds } = dateExplode(ts)

    // Create a custom formatted string in "YYYY-MM-DD HH:MM:SS" format
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  } catch (error) {
    console.error("Date parsing error:", error);
    return ''; // Return an empty string if parsing or formatting fails
  }
}


/**
 * Formats a Unix timestamp into a string using the specified format.
 *
 * @param ts - The Unix timestamp(in seconds) to format.
 * @param fmt - The format string for the desired date and time format.
 * Supported format tokens:
 * - "dd": Day of the month as a zero - padded string(e.g., "05" for the 5th).
 * - "MM": Month as a zero - padded string(e.g., "04" for April).
 * - "yyyy": Full year(e.g., "2023").
 * - "h": Hours in 24 - hour format as a zero - padded string(e.g., "09").
 * - "mm": Minutes as a zero - padded string(e.g., "30").
 * - "ss": Seconds as a zero - padded string(e.g., "45").
 * @returns A formatted date and time string based on the specified format.
 * If the input is invalid or formatting fails, an empty string is returned.
 */
export const formatDate = (ts: number, fmt: string): string => {
  try {
    if (typeof ts !== "number") {
      throw new Error("Invalid input: ts must be a number.");
    }

    const { year, month, day, hours, minutes, seconds } = dateExplode(ts)

    return fmt
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year)
      .replace('h', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);

  } catch (error) {
    console.error("Date parsing error:", error);
    return ''; // Return an empty string if parsing or formatting fails
  }
}

/**
 * Formats a duration in seconds into a string representing days, hours, minutes, and seconds.
 * Example output: "3 Days 04:15:30"
 *
 * @param seconds - The duration in seconds to format.
 * @returns A formatted string representing the duration.
 */
export const formatSeconds = (seconds: number) => {
  if (seconds < 1) {
    return 'N/A';
  }

  const secondsInDay = 60 * 60 * 24;
  let formatted = '';

  if (seconds >= secondsInDay) {
    const days = Math.floor(seconds / secondsInDay);
    const dayLabel = days === 1 ? ' Day ' : ' Days ';
    const daysFormatted = `${days}${dayLabel}`;

    seconds = seconds - days * secondsInDay; // Remaining Time
    formatted += daysFormatted;
  }

  const date = new Date(seconds * 1000);
  const timeString = date.toISOString().slice(11, 19);

  formatted += timeString;
  return formatted;
};







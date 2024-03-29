import { Timestamp } from "../database";

/**
 *  Convert from string date into firebase Timestamp object.
 *
 *  @param {string} date (e.g. 2012-01-31)
 *  @returns {Timestamp}
 *  {
 *    seconds: number,
 *    nanoseconds: number,
 *  }
 */
export const dateToTimestamp = (date: string) => {
  const compatibleObject = new Date(date + "T00:00:00");
  return Timestamp.fromDate(compatibleObject);
};

export const timestampToDate = ({
  seconds,
  nanoseconds,
}: {
  seconds: number;
  nanoseconds: number;
}): string => {
  const date = new Date(seconds * 1e3 + nanoseconds / 1e6);
  return `${getStringMonth(
    date.getMonth()
  )} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 *  Returns date string from timestamp object.
 *
 *  @param {Object}
 *  @returns {string} eg. 2012-01-01
 */
export const timestampToDate2 = ({
  seconds,
  nanoseconds,
}: {
  seconds: number;
  nanoseconds: number;
}): string => {
  const date = new Date(seconds * 1e3 + nanoseconds / 1e6);
  return date.toISOString().substr(0, 10);
};

/**
 *  Get the Month in English based on index given.
 *
 *  @param {number} index
 *  @returns {string}
 */
export const getStringMonth = (index: number): string => {
  const months = [
    "January",
    "Febrauary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[index];
};

/**
 *  Get the AM or PM of a given 24-hour time.
 *
 *  @param {number} hours
 *  @returns {string} "am" | "pm"
 */
export const getAMPM = (hours: number) => {
  return hours > 12 ? "pm" : "am";
};

/**
 *  Get the time in string based on timesatmp object.
 *
 *  @param {Object} Timestamp
 *  @returns {string}
 */
export const timestampGetTime = ({
  seconds,
  nanoseconds,
}: {
  seconds: number;
  nanoseconds: number;
}) => {
  const date = new Date(seconds * 1e3 + nanoseconds / 1e6);
  return `${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

/**
 *  Check if an object is empty.
 *
 *  @param {Object} obj
 *
 *  @returns {boolean}
 */
export const isEmpty = (obj: Object): boolean => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export type BookingTime = {
  startTime: number;
  endTime: number;
};

/**
 *  Compute the discussion booking time based on the determined day.
 *
 *  @param {Array<BookingTime>} bookings
 *  @returns
 *  {
 *    startTime: number,
 *    endTime: number
 *  }
 */
export const computeTime = (bookings: Array<BookingTime>) => {
  let startTime = 0;
  let endTime = 24;

  bookings.forEach((booking) => {
    if (booking.startTime == 0 && booking.endTime == 24) return;
    else if (booking.startTime > endTime) return;
    else if (booking.endTime < startTime) return;
    if (booking.startTime > startTime) startTime = booking.startTime;
    if (booking.endTime < endTime) endTime = booking.endTime;
  });

  return { startTime, endTime };
};

export type Booking = {
  memberId: string;
  sunday: BookingTime | {};
  monday: BookingTime | {};
  tuesday: BookingTime | {};
  wednesday: BookingTime | {};
  thursday: BookingTime | {};
  friday: BookingTime | {};
  saturday: BookingTime | {};
  updatedAt: any;
};

/**
 *  Compute the most available day of the week and call computeTime
 *  to get the determined time.
 *
 *  @param {Booking[]} bookings
 *  @returns {Object}
 *
 *  {
 *    startTime: number,
 *    endTime: number,
 *    day: string
 *  }
 */
export const bookingAlgorithm = (bookings: Booking[]) => {
  let majority: BookingTime[];
  let day: string = "";
  let sunday = 0,
    monday = 0,
    tuesday = 0,
    wednesday = 0,
    thursday = 0,
    friday = 0,
    saturday = 0;
  bookings.forEach((booking) => {
    if (!isEmpty(booking.sunday)) sunday++;
    if (!isEmpty(booking.monday)) monday++;
    if (!isEmpty(booking.tuesday)) tuesday++;
    if (!isEmpty(booking.wednesday)) wednesday++;
    if (!isEmpty(booking.thursday)) thursday++;
    if (!isEmpty(booking.friday)) friday++;
    if (!isEmpty(booking.saturday)) saturday++;
  });

  if (
    sunday > monday &&
    sunday > tuesday &&
    sunday > wednesday &&
    sunday > thursday &&
    sunday > friday &&
    sunday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.sunday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "sunday";
  } else if (
    monday > sunday &&
    monday > tuesday &&
    monday > wednesday &&
    monday > thursday &&
    monday > friday &&
    monday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.monday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "monday";
  } else if (
    tuesday > sunday &&
    tuesday > monday &&
    tuesday > wednesday &&
    tuesday > thursday &&
    tuesday > friday &&
    tuesday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.tuesday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "tuesday";
  } else if (
    wednesday > sunday &&
    wednesday > monday &&
    wednesday > tuesday &&
    wednesday > thursday &&
    wednesday > friday &&
    wednesday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.wednesday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "wednesday";
  } else if (
    thursday > sunday &&
    thursday > monday &&
    thursday > wednesday &&
    thursday > tuesday &&
    thursday > friday &&
    thursday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.thursday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "thursday";
  } else if (
    friday > sunday &&
    friday > monday &&
    friday > wednesday &&
    friday > thursday &&
    friday > tuesday &&
    friday > saturday
  ) {
    majority = bookings
      .map((booking) => booking.friday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "friday";
  } else if (
    saturday > sunday &&
    saturday > monday &&
    saturday > wednesday &&
    saturday > thursday &&
    saturday > friday &&
    saturday > tuesday
  ) {
    majority = bookings
      .map((booking) => booking.saturday)
      .filter((day) => !isEmpty(day)) as BookingTime[];
    day = "saturday";
  } else {
    majority = [
      { startTime: 0, endTime: 23 },
      { startTime: 5, endTime: 17 },
    ];
  }

  return { ...computeTime(majority), day };
};

/**
 *  Python random.choice function duplicate.
 *  Randomly selects one item from the provided array and returns.
 *
 *  @param {Array<>} arr
 *  @returns Items in array
 */
export const randomChoice = (arr: Array<any>) => {
  const size = arr.length;
  return arr[Math.floor(Math.random() * size)];
};

/**
 *  Randomly selects an item in an array.
 *
 *  @param {Array<any>} arr
 *
 *  @returns {Object}
 *
 *  {
 *    removedItem: any,
 *    arr: any[]
 *  }
 */
export const randomPop = (arr: Array<any>) => {
  const size: number = arr.length;
  const removedItem: any = arr.splice(Math.floor(Math.random() * size), 1)[0];
  return { removedItem, arr };
};

import * as utils from "../utils";

describe("Testing every functions in utils file", (): void => {
  describe("Testing dateToTimestamp", (): void => {
    it("should convert from string into Timestamp", (): void => {
      const date: string = "2012-01-31";
      const expected: Object = {
        seconds: 1327939200,
        nanoseconds: 0,
      };

      expect(utils.dateToTimestamp(date)).toEqual(expected);
    });

    it("should return NaN for invalid date", (): void => {
      const date: string = "2012-01-51";
      const date2: string = "99999-01-31";
      const date3: string = "abc";
      const expected: Object = {
        seconds: NaN,
        nanoseconds: NaN,
      };

      expect(utils.dateToTimestamp(date)).toEqual(expected);
      expect(utils.dateToTimestamp(date2)).toEqual(expected);
      expect(utils.dateToTimestamp(date3)).toEqual(expected);
    });
  });

  // describe("Testing timestampToDate", (): void => {

  it("should convert from Timestamp to string", (): void => {
    const timestamp = {
      seconds: 1327939200,
      nanoseconds: 0,
    };
    const expected: string = "January 31, 2012";

    expect(utils.timestampToDate(timestamp)).toMatch(expected);
  });

  // });

  it("should convert from Timestamp to string 2", (): void => {
    const timestamp = {
      seconds: 1327939200,
      nanoseconds: 0,
    };
    const expected: string = "2012-01-30";

    expect(utils.timestampToDate2(timestamp)).toMatch(expected);
  });

  it("should get the Month from index", (): void => {
    const index: number = 1;
    const index2: number = 3;
    const expected: string = "Febrauary";
    const expected2: string = "April";
    const invalidIndex: number = 16;

    expect(utils.getStringMonth(index)).toMatch(expected);
    expect(utils.getStringMonth(index2)).toMatch(expected2);
    expect(utils.getStringMonth(invalidIndex)).toBe(undefined);
  });

  it("should get AM PM according to hours", (): void => {
    const hourValid: number = 3;
    const hourValid2: number = 16;
    const hourInvalid: number = -1;
    const hourInvalid2: number = 999;
    const am = "am";
    const pm = "pm";

    expect(utils.getAMPM(hourValid)).toMatch(am);
    expect(utils.getAMPM(hourValid2)).toMatch(pm);
    expect(utils.getAMPM(hourInvalid)).toMatch(am);
    expect(utils.getAMPM(hourInvalid2)).toMatch(pm);
  });

  it("should get padded time only from Timestamp object", (): void => {
    const timestamp = {
      seconds: 1327939200,
      nanoseconds: 0,
    };
    const expected: string = "00:00";
    expect(utils.timestampGetTime(timestamp)).toMatch(expected);
  });

  it("should validate the emptyness of an object", (): void => {
    const emptyObj: Object = {};
    const objWithSmth: Object = { a: 1 };

    expect(utils.isEmpty(emptyObj)).toBe(true);
    expect(utils.isEmpty(objWithSmth)).toBe(false);
  });

  it("should select the correct timeperiod", (): void => {
    const times: utils.BookingTime[] = [
      {
        startTime: 1,
        endTime: 5,
      },
      {
        startTime: 3,
        endTime: 6,
      },
    ];
    const expected = {
      startTime: 3,
      endTime: 5,
    };

    expect(utils.computeTime(times)).toEqual(expected);
  });

  it("should return majority booking time and date correctly", (): void => {
    const bookings: utils.Booking[] = [
      {
        memberId: "not important",
        updatedAt: "not important",
        sunday: { startTime: 0, endTime: 24 },
        monday: { startTime: 16, endTime: 18 },
        tuesday: {},
        wednesday: { startTime: 19, endTime: 24 },
        thursday: {},
        friday: {},
        saturday: {},
      },
      {
        memberId: "not important",
        updatedAt: "not important",
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: { startTime: 10, endTime: 22 },
        thursday: { startTime: 15, endTime: 18 },
        friday: {},
        saturday: {},
      },
    ];

    const expected: Object = {
      startTime: 19,
      endTime: 22,
      day: "wednesday",
    };

    expect(utils.bookingAlgorithm(bookings)).toEqual(expected);
  });

  it("should work as the same as Python random_choice function", (): void => {
    const mathrandom = global.Math.random;
    global.Math.random = () => 0.123;

    const arr: number[] = [1, 2, 3];

    expect(utils.randomChoice(arr)).toBe(1);

    global.Math.random = mathrandom;
  });

  it("should randomly remove an item from array", (): void => {
    const mathrandom = global.Math.random;
    global.Math.random = () => 0.123;

    const arr: number[] = [1, 2, 3];
    const expected: Object = {
      removedItem: 1,
      arr: [2, 3],
    };

    expect(utils.randomPop(arr)).toEqual(expected);

    global.Math.random = mathrandom;
  });
});

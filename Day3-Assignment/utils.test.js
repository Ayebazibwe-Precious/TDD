const utils = require("./utils");

describe("Utility module - matchers checklist", () => {

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });


  describe("Exact equality", () => {
    test("toBe - passing: sum(2,2) === 4", () => {
      expect(utils.sum(2, 2)).toBe(4);
    });

    test("toBe - FAILING example: sum(1,1) === 3 (intentional failure)", () => {
      
      expect(utils.sum(1, 1)).toBe(3);
    });

    test("toEqual - comparing created object (deterministic createdAt)", () => {
      const u = utils.createUser("Alice", 30);
      expect(u).toEqual({
        name: "Alice",
        age: 30,
        createdAt: new Date("2020-01-01T00:00:00.000Z"),
      });
    });

    test("toEqual - FAILING example (different name)", () => {
      const u = utils.createUser("Alice", 30);
      expect(u).toEqual({
        name: "Bob", 
        age: 30,
        createdAt: new Date("2020-01-01T00:00:00.000Z"),
      });
    });

    test("toEqual vs toStrictEqual - sparse array example", () => {
      const sparse = [1, , 3]; // has a hole at index 1
      const explicit = [1, undefined, 3];

      expect(sparse).toEqual(explicit);
    });

    test("toStrictEqual - FAILING example: sparse array vs explicit undefined", () => {
      const sparse = [1, , 3];
      const explicit = [1, undefined, 3];

      expect(sparse).toStrictEqual(explicit);
    });
  });

  
  // 2. Negation 
  describe("Negation (.not)", () => {
    test("not.toBe - passing", () => {
      expect(utils.sum(1, 1)).not.toBe(3);
    });

    test("not.toBe - FAILING example (sum equals 4 but we assert not toBe 4)", () => {
      expect(utils.sum(2, 2)).not.toBe(4);
    });

    test("combine .not with toMatch", () => {
      const u = utils.createUser("Carol", 25);
      expect(u.name).not.toMatch(/Bob/);
    });
  });

// 3. Truthiness matchers
  describe("Truthiness matchers", () => {
    const returnNull = () => null;
    const returnUndefined = () => undefined;

    test("toBeNull - passing", () => {
      expect(returnNull()).toBeNull();
    });

    test("toBeNull - FAILING example", () => {
      expect("not null").toBeNull();
    });

    test("toBeUndefined - passing", () => {
      expect(returnUndefined()).toBeUndefined();
    });

    test("toBeUndefined - FAILING example", () => {
      expect(0).toBeUndefined();
    });

    test("toBeDefined - passing", () => {
      const u = utils.createUser("D", 10);
      expect(u).toBeDefined();
      expect(u.name).toBeDefined();
    });

    test("toBeTruthy - passing (findInArray true)", () => {
      expect(utils.findInArray([1, 2, 3], 2)).toBeTruthy();
    });

    test("toBeFalsy - passing (findInArray false)", () => {
      expect(utils.findInArray([1, 2, 3], 4)).toBeFalsy();
    });

    test("toBeTruthy - FAILING example", () => {
      expect(utils.findInArray([1, 2, 3], 4)).toBeTruthy();
    });
  });

  // 4. Number matchers
  describe("Number matchers", () => {
    test("toBeGreaterThan / toBeGreaterThanOrEqual", () => {
      expect(utils.sum(2, 3)).toBeGreaterThan(4);
      expect(utils.sum(2, 3)).toBeGreaterThanOrEqual(5);
    });

    test("toBeLessThan / toBeLessThanOrEqual", () => {
      expect(utils.approximateDivision(10, 2)).toBeLessThan(6);
      expect(utils.approximateDivision(10, 2)).toBeLessThanOrEqual(5);
    });

    test("toBeCloseTo - dealing with floating point rounding", () => {
      expect(utils.approximateDivision(0.3, 0.1)).toBeCloseTo(3, 10);
    });

    test("toBeGreaterThan - FAILING example", () => {
      expect(utils.sum(1, 1)).toBeGreaterThan(5);
    });
  });

  // 5. String matchers
  describe("String matchers", () => {
    test("toMatch - JSON contains name", () => {
      const u = utils.createUser("Eve", 22);
      const s = JSON.stringify(u);
      expect(s).toMatch(/"name":"Eve"/);
    });

    test("not.toMatch - FAILING example (will fail because it does match)", () => {
      const u = utils.createUser("Frank", 18);
      const s = JSON.stringify(u);
      expect(s).not.toMatch(/Frank/);
    });
  });
  // 6. Arrays / Iterables (toContain)
  describe("Arrays / Iterables", () => {
    test("toContain - array contains value", () => {
      const arr = [10, 20, 30];
      expect(arr).toContain(20);
    });

    test("toContain - Set contains value", () => {
      const s = new Set([1, 2, 3]);
      expect(s).toContain(2);
    });

    test("toContain - FAILING example", () => {
      const arr = ["a", "b", "c"];
      expect(arr).toContain("z");
    });

    test("not.toContain - passing", () => {
      const arr = ["x", "y", "z"];
      expect(arr).not.toContain("a");
    });
  });

  // 7. Exceptions (toThrow)
  describe("Exceptions", () => {
    test("parseJSON throws on invalid JSON", () => {
      expect(() => utils.parseJSON("not-json")).toThrow();
      expect(() => utils.parseJSON("not-json")).toThrow(SyntaxError);
    });

    test("parseJSON throws when called with no argument", () => {
      expect(() => utils.parseJSON()).toThrow("No JSON string provided");
    });

    test("toThrow - FAILING example (expecting no throw)", () => {
      expect(() => utils.parseJSON("not-json")).not.toThrow();
    });

    test("parseJSON - successful parse (passing)", () => {
      expect(utils.parseJSON('{"ok":true}')).toEqual({ ok: true });
    });
  });
});

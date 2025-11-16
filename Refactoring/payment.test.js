const PaymentProcessor = require("./payment");

describe("PaymentProcessor", () => {
  let apiClient;
  let processor;

  beforeEach(() => {
    apiClient = {
      post: jest.fn(),
    };
    processor = new PaymentProcessor(apiClient);

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  // 1. VALIDATION
  test("throws for invalid credit-card metadata", () => {
    expect(() =>
      processor.processPayment(
        100,
        "USD",
        1,
        "credit_card",
        { expiry: "12/25" }, 
        null,
        0
      )
    ).toThrow("Invalid card metadata");
  });

  test("throws for invalid PayPal metadata", () => {
    expect(() =>
      processor.processPayment(
        50,
        "USD",
        1,
        "paypal",
        { cardNumber: "123" }, 
        null,
        0
      )
    ).toThrow("Invalid PayPal metadata");
  });

  test("throws for unsupported payment method", () => {
    expect(() =>
      processor.processPayment(50, "USD", 1, "crypto", {}, null, 0)
    ).toThrow("Unsupported payment method");
  });

  // 2. DISCOUNTS
  test("applies SUMMER20 discount", () => {
    const tx = processor.processPayment(
      100,
      "USD",
      1,
      "credit_card",
      { cardNumber: "123", expiry: "12/25" },
      "SUMMER20",
      0
    );

    expect(tx.finalAmount).toBe(80);
  });

  test("applies WELCOME10 discount", () => {
    const tx = processor.processPayment(
      50,
      "USD",
      1,
      "paypal",
      { paypalAccount: "test" },
      "WELCOME10",
      0
    );

    expect(tx.finalAmount).toBe(40);
  });

  // 3. CURRENCY CONVERSION
  test("converts amount if not USD", () => {
    const tx = processor.processPayment(
      100,
      "EUR",
      1,
      "credit_card",
      { cardNumber: "123", expiry: "12/25" },
      null,
      0
    );

    expect(tx.finalAmount).toBe(100 * processor.currencyConversionRate);
  });

  // 4. FRAUD CHECKS
  test("performs light fraud check for <100", () => {
    processor._lightFraudCheck = jest.fn();
    processor._heavyFraudCheck = jest.fn();

    processor.processPayment(
      50,
      "USD",
      1,
      "credit_card",
      { cardNumber: "123", expiry: "12/25" },
      null,
      1
    );

    expect(processor._lightFraudCheck).toHaveBeenCalled();
    expect(processor._heavyFraudCheck).not.toHaveBeenCalled();
  });

  test("performs heavy fraud check for >=100", () => {
    processor._lightFraudCheck = jest.fn();
    processor._heavyFraudCheck = jest.fn();

    processor.processPayment(
      150,
      "USD",
      1,
      "credit_card",
      { cardNumber: "123", expiry: "12/25" },
      null,
      1
    );

    expect(processor._heavyFraudCheck).toHaveBeenCalled();
  });

  // 5. API CALLS
  test("sends credit-card payment via API", () => {
    const tx = processor.processPayment(
      100,
      "USD",
      1,
      "credit_card",
      { cardNumber: "123", expiry: "12/25" },
      null,
      0
    );

    expect(apiClient.post).toHaveBeenCalledWith("/payments/credit", tx);
  });

  test("sends PayPal payment via API", () => {
    const tx = processor.processPayment(
      100,
      "USD",
      1,
      "paypal",
      { paypalAccount: "acc" },
      null,
      0
    );

    expect(apiClient.post).toHaveBeenCalledWith("/payments/paypal", tx);
  });

  // 6. REFUND
  test("refund applies 5% fee", () => {
    const refund = processor.refundPayment(
      "tx123",
      1,
      "reason",
      100,
      "USD",
      {}
    );

    expect(refund.netAmount).toBe(95); 
  });

  test("refund sends API call", () => {
    processor.refundPayment("tx1", 1, "test", 50, "USD", {});

    expect(apiClient.post).toHaveBeenCalledWith(
      "/payments/refund",
      expect.any(Object)
    );
  });
});

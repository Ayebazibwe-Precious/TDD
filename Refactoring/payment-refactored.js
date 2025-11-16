class PaymentProcessor {
  constructor(apiClient, config = {}) {
    this.apiClient = apiClient;
    this.rates = {
      conversion: config.conversionRate || 1.2,
    };

    this.discounts = {
      SUMMER20: (amount) => amount * 0.8,
      WELCOME10: (amount) => amount - 10,
    };
  }

  processPayment(amount, currency, userId, method, metadata, discount, fraud) {
    this._validate(method, metadata);
    this._runFraudCheck(fraud, userId, amount);

    let finalAmount = this._applyDiscount(amount, discount);
    finalAmount = this._convertCurrency(finalAmount, currency);

    const transaction = this._createTransaction({
      amount,
      finalAmount,
      currency,
      userId,
      method,
      metadata,
      discount,
      fraud,
    });

    this._sendToApi(method, transaction);
    this._sendConfirmationEmail(userId, finalAmount, currency);
    this._logAnalytics({ userId, amount: finalAmount, currency, method });

    return transaction;
  }

  // ---- Small single-responsibility methods ----

  _validate(method, metadata) {
    const validators = {
      credit_card: () => {
        if (!metadata.cardNumber || !metadata.expiry) {
          throw new Error("Invalid card metadata");
        }
      },
      paypal: () => {
        if (!metadata.paypalAccount) throw new Error("Invalid PayPal metadata");
      },
    };

    if (!validators[method]) throw new Error("Unsupported payment method");
    validators[method]();
  }

  _runFraudCheck(level, userId, amount) {
    if (level <= 0) return;

    return amount < 100
      ? this._lightFraudCheck(userId, amount)
      : this._heavyFraudCheck(userId, amount);
  }

  _applyDiscount(amount, code) {
    if (!code) return amount;

    return this.discounts[code]?.(amount) ?? amount;
  }

  _convertCurrency(amount, currency) {
    if (currency === "USD") return amount;
    return amount * this.rates.conversion;
  }

  _createTransaction({
    amount,
    finalAmount,
    currency,
    userId,
    method,
    metadata,
    discount,
    fraud,
  }) {
    return {
      userId,
      originalAmount: amount,
      finalAmount,
      currency,
      paymentMethod: method,
      metadata,
      discountCode: discount,
      fraudChecked: fraud,
      timestamp: new Date().toISOString(),
    };
  }

  _sendToApi(method, transaction) {
    const endpoints = {
      credit_card: "/payments/credit",
      paypal: "/payments/paypal",
    };
    return this.apiClient.post(endpoints[method], transaction);
  }

  refundPayment(transactionId, userId, reason, amount, currency, metadata) {
    const refundFeeRate = 0.05;
    const refund = {
      transactionId,
      userId,
      reason,
      amount,
      currency,
      metadata,
      date: new Date(),
    };

    refund.netAmount = amount - amount * refundFeeRate;

    this.apiClient.post("/payments/refund", refund);
    return refund;
  }
}

module.exports = PaymentProcessor;

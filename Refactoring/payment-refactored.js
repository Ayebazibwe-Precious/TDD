class PaymentProcessor {
  constructor(apiClient, config = {}) {
    this.apiClient = apiClient;

    // Configurable currency conversion
    this.rates = {
      conversion: config.conversionRate || 1.2,
    };

    // Centralized discount strategy pattern
    this.discounts = {
      SUMMER20: (amount) => amount * 0.8,
      WELCOME10: (amount) => amount - 10,
    };
  }

  processPayment(amount, currency, userId, method, metadata, discount, fraud) {
    // 1. Validate metadata
    this._validate(method, metadata);

    // 2. Fraud check
    this._runFraudCheck(fraud, userId, amount);

    // 3. Apply discount
    let finalAmount = this._applyDiscount(amount, discount);

    // 4. Convert currency
    finalAmount = this._convertCurrency(finalAmount, currency);

    // 5. Create transaction object
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

    // 6. Send to API
    this._sendToApi(method, transaction);

    // 7. Confirmation email + Analytics
    this._sendConfirmationEmail(userId, finalAmount, currency);
    this._logAnalytics({ userId, amount: finalAmount, currency, method });

    return transaction;
  }

  // VALIDATION
  _validate(method, metadata) {
    const validators = {
      credit_card: () => {
        if (!metadata.cardNumber || !metadata.expiry) {
          throw new Error("Invalid card metadata");
        }
      },
      paypal: () => {
        if (!metadata.paypalAccount) {
          throw new Error("Invalid PayPal metadata");
        }
      },
    };

    if (!validators[method]) {
      throw new Error("Unsupported payment method");
    }

    validators[method]();
  }

  
  // FRAUD CHECKING
  _runFraudCheck(level, userId, amount) {
    if (level <= 0) return;

    return amount < 100
      ? this._lightFraudCheck(userId, amount)
      : this._heavyFraudCheck(userId, amount);
  }

  _lightFraudCheck(userId, amount) {
    console.log(`Light fraud check for user ${userId} on ${amount}`);
    if (amount < 10) {
      console.log("Very low risk");
    } else {
      console.log("Low risk");
    }
  }

  _heavyFraudCheck(userId, amount) {
    console.log(`Heavy fraud check for user ${userId} on ${amount}`);
    if (amount < 1000) {
      console.log("Medium risk");
    } else {
      console.log("High risk");
    }
  }


  // DISCOUNTS & CONVERSION
  
  _applyDiscount(amount, code) {
    if (!code) return amount;
    return this.discounts[code]?.(amount) ?? amount;
  }

  _convertCurrency(amount, currency) {
    if (currency === "USD") return amount;
    return amount * this.rates.conversion;
  }

  
  // TRANSACTION CREATION
  
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

  
  // API CALL
  
  _sendToApi(method, transaction) {
    const endpoints = {
      credit_card: "/payments/credit",
      paypal: "/payments/paypal",
    };

    return this.apiClient.post(endpoints[method], transaction);
  }

 
  // EMAIL + ANALYTICS
  
  _sendConfirmationEmail(userId, amount, currency) {
    console.log(
      `Sending email to user ${userId}: Your payment of ${amount} ${currency} was successful.`
    );
  }

  _logAnalytics(data) {
    console.log("Analytics event:", data);
  }

  
  // REFUNDS
  
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

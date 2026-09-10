# DejoiY Pay — Technical Architecture Specification

## 1. System Overview

**DejoiY Pay** is a unified payment gateway, consumer wallet, and merchant financial platform designed for high-volume Indian and international commerce. It provides an abstraction layer over 5 major industry payment providers (Razorpay, Stripe, Paytm, Paytm Business, Amazon Pay) alongside native Direct UPI (NPCI 2.0) routing.

```
                               ┌────────────────────────────────────────────────────────┐
                               │                      DEJOIY PAY                         │
                               │                                                        │
   Consumer Web / Mobile ─────▶│  ┌──────────────┐     ┌──────────────┐    ┌─────────┐  │
   (Wallet, Scan, Pay, Bills)  │  │  App Router  │────▶│ Auth & Guard │───▶│ Ledger  │  │
                               │  │  Next.js 14  │     │ Idempotency  │    │ Engine  │  │
   Merchant Business Console ─▶│  └──────┬───────┘     └──────────────┘    └────┬────┘  │
   (Settlement, QR, Analytics) │         │                                      │       │
                               │         ▼                                      ▼       │
   Hosted Checkout / SDK ─────▶│  ┌──────────────────────────────────────────────────┐  │
   (Tokenized Cards, UPI)      │  │        Payment Provider Abstraction Layer        │  │
                               │  │  IPaymentProvider (Standard Interface Contract)  │  │
                               │  └────────┬─────────────────────────────────────────┘  │
                               └───────────┼────────────────────────────────────────────┘
                                           │
         ┌───────────────┬─────────────────┼──────────────────┬─────────────────┐
         ▼               ▼                 ▼                  ▼                 ▼
   Direct UPI        Razorpay           Stripe              Paytm           Amazon Pay
   (NPCI VPA/QR)    (Cards/EMI)      (3DS2/Global)     (Wallet/Postpaid)   (1-Click Pay)
```

## 2. Core Subsystems

### 2.1 Provider Abstraction Layer (`src/lib/providers/`)
All providers adhere to the `IPaymentProvider` interface:
- `createOrder(req)`: Standardizes order initialization
- `createPayment(req)`: Executes payment processing with tokenized cards or UPI intent
- `verifyPayment(params)`: Validates signatures and callback payloads
- `capturePayment(paymentId, amount)`: Finalizes authorization holds
- `refundPayment(req)`: Processes full or partial refunds
- `verifyWebhook(rawBody, headers)`: Cryptographic HMAC signature verification

### 2.2 Payment State Machine
Transactions strictly advance through deterministic states:
```
  CREATED ──────────▶ PENDING ──────────▶ PROCESSING ──────────▶ SUCCESS ───▶ REFUND_PENDING
     │                   │                                         │               │
     ▼                   ▼                                         ▼               ▼
  CANCELLED           FAILED                                    PARTIAL         REFUNDED
     │                                                          REFUND
     ▼
  EXPIRED
```

### 2.3 Double-Entry Ledger & Idempotency
- **Idempotency**: All `POST /api/v1/payments` and refund operations require an `Idempotency-Key` header. Requests within the 24-hour TTL window return the cached response, preventing double-debits.
- **Audit Logs**: Every status mutation, refund, and key rotation is logged immutably with actor attribution and timestamps.

### 2.4 Mobile-First Responsive Design
- Optimized breakpoints: 320px, 360px, 375px, 390px, 414px, 768px, 1024px, 1440px+.
- Adaptive UI elements: Mobile bottom bars and touch-target cards that transition seamlessly to desktop data tables and sidebars.

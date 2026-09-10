# DejoiY Pay — API Reference v1

Base URL: `http://localhost:3030/api/v1`

## Authentication
Requests from backends must pass the secret API key in the Authorization header:
```http
Authorization: Bearer dj_sec_test_...
```

## Endpoints Summary

### 1. Health & Status
- `GET /health`
  Returns service status, environment, and configured payment provider capabilities.

### 2. Payments & Orders
- `GET /payments?status={STATUS}&provider={PROVIDER}&limit=50&offset=0`
  List transactions with filtering and pagination.
- `POST /payments`
  Initialize or process a payment with an `Idempotency-Key` header.
  ```json
  {
    "amount": 1500.00,
    "currency": "INR",
    "provider": "direct-upi",
    "method": "upi",
    "customer": {
      "name": "Aakash Sharma",
      "email": "aakash@example.com",
      "phone": "+91 98765 43210"
    },
    "paymentData": {
      "vpa": "aakash@okhdfcbank"
    }
  }
  ```
- `GET /payments/:id`
  Fetch payment details, audit timeline, fee breakdown, and customer profile.
- `POST /payments/:id/refund`
  Initiate full or partial refund.
  ```json
  {
    "amount": 500.00,
    "reason": "Customer requested cancellation"
  }
  ```

### 3. Payment Links
- `GET /payment-links`
- `POST /payment-links`
- `GET /payment-links/:id`

### 4. QR Codes
- `POST /qr/dynamic`
  Create a dynamic invoice QR with expiration countdown.

### 5. Settlements
- `GET /settlements`
  List past settlement batches.
- `POST /settlements`
  Trigger an instant merchant bank disbursement batch.

### 6. Webhooks
- `POST /webhooks/razorpay`
- `POST /webhooks/stripe`
- `POST /webhooks/simulate` (Developer testing tool)

### 7. Consumer Wallet
- `GET /consumer/wallet`
- `POST /consumer/wallet` (Add money)
- `POST /consumer/send-money` (UPI/Bank transfer with PIN verification)
- `POST /consumer/bills` (Utility bill payment)
- `POST /consumer/upi/validate` (VPA format and bank handle lookup)

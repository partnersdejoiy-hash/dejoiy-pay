# DejoiY Pay

Production-grade payment ecosystem, consumer wallet, and merchant financial platform built for scale.

## Core Capabilities
- **Multi-Provider Architecture**: Standardized abstraction supporting Direct UPI, Razorpay, Stripe, Paytm, Paytm Business, and Amazon Pay.
- **Consumer Wallet Experience**: Mobile-first interface with Send Money, Scan & Pay, Utility Bills (BBPS), Passbook, and UPI PIN security.
- **Merchant Business Dashboard**: Real-time GMV, success rates, full/partial refund workflows, payment links, counter QR standees, instant bank settlements, and soundbox voice alerts.
- **Hosted Checkout**: Distraction-free payment page supporting UPI Intent, Dynamic QR, Tokenized Cards, Net Banking, and Wallets.
- **Fintech Security**: Idempotent request handling, HMAC-SHA256 signature verification, and zero raw card storage.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run unit & integration tests
pnpm test

# 3. Build production bundle
pnpm build

# 4. Start production server
pnpm start # runs on port 3030
```

## Default URLs
- **Landing Portal**: `http://localhost:3030/`
- **Consumer Wallet**: `http://localhost:3030/consumer`
- **Merchant Console**: `http://localhost:3030/merchant`
- **Hosted Checkout**: `http://localhost:3030/checkout/demo`
- **Health API**: `http://localhost:3030/api/v1/health`

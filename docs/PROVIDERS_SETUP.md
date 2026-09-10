# DejoiY Pay — Payment Provider Configuration Guide

Configure these credentials in `/root/dejoiy-pay/.env` to switch from Sandbox to Live provider connections:

### 1. Direct UPI (NPCI 2.0)
- `NEXT_PUBLIC_UPI_MERCHANT_VPA`: Your registered business UPI ID (e.g. `merchant@icici`)
- `NEXT_PUBLIC_UPI_MERCHANT_NAME`: Legal business entity name
- `UPI_MCC`: Merchant Category Code (e.g. `6012` for software, `5411` for groceries)

### 2. Razorpay
- `RAZORPAY_KEY_ID`: `rzp_live_...` or `rzp_test_...`
- `RAZORPAY_KEY_SECRET`: Razorpay API secret key
- `RAZORPAY_WEBHOOK_SECRET`: Webhook signing secret configured on Razorpay Dashboard

### 3. Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...` or `pk_test_...`
- `STRIPE_SECRET_KEY`: `sk_live_...` or `sk_test_...`
- `STRIPE_WEBHOOK_SECRET`: `whsec_...`

### 4. Paytm & Paytm Business
- `PAYTM_MERCHANT_ID`: Assigned MID
- `PAYTM_MERCHANT_KEY`: Merchant production encryption key
- `PAYTM_WEBSITE`: `DEFAULT` (for production) or `WEBSTAGING`

### 5. Amazon Pay
- `AMAZON_PAY_MERCHANT_ID`: Amazon Merchant Account ID
- `AMAZON_PAY_PUBLIC_KEY_ID`: Public Key ID registered in Amazon Pay Seller Central

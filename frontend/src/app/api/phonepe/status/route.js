import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('id');
    const isSimulated = searchParams.get('simulated');
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim().replace(/['"]/g, '');

    if (!transactionId) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=missing_id`, { status: 303 });
    }

    // Dev Simulation Request check
    if (isSimulated === 'true') {
      console.log(`[SIMULATED] Payment Verified COMPLETED for Order ID: ${transactionId}`);
      return NextResponse.redirect(`${baseUrl}/order-success?orderId=${transactionId}`, { status: 303 });
    }

    const merchantId = (process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT').trim().replace(/['"]/g, '');
    const saltKey = (process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399').trim().replace(/['"]/g, '');
    const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim().replace(/['"]/g, '');

    const apiPath = `/pg/v1/status/${merchantId}/${transactionId}`;
    const stringToHash = apiPath + saltKey;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    // PhonePe Server Status API Request
    const response = await fetch(`https://api-preprod.phonepe.com/apis/pg-sandbox${apiPath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': merchantId,
      },
    });

    const statusData = await response.json();
    console.log('--- PhonePe Status Check Response ---', JSON.stringify(statusData, null, 2));

    // Server Verification: State must be COMPLETED / PAYMENT_SUCCESS
    if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
      return NextResponse.redirect(`${baseUrl}/order-success?orderId=${transactionId}`, { status: 303 });
    } else {
      return NextResponse.redirect(`${baseUrl}/checkout?error=payment_failed`, { status: 303 });
    }
  } catch (error) {
    console.error('PhonePe Status Verification Error:', error);
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim().replace(/['"]/g, '');
    return NextResponse.redirect(`${baseUrl}/checkout?error=server_error`, { status: 303 });
  }
}

export async function GET(req) {
  return POST(req);
}
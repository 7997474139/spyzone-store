import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { totalAmount, orderId, phone } = await req.json();

    const merchantId = (process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT').trim().replace(/['"]/g, '');
    const saltKey = (process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399').trim().replace(/['"]/g, '');
    const saltIndex = (process.env.PHONEPE_SALT_INDEX || '1').trim().replace(/['"]/g, '');
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim().replace(/['"]/g, '');

    const amountInPaise = Math.round(Number(totalAmount || 1) * 100);

    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderId,
      merchantUserId: 'MUID_' + (phone || '9999999999'),
      amount: amountInPaise,
      redirectUrl: `${baseUrl}/api/phonepe/status?id=${orderId}`,
      redirectMode: 'POST',
      callbackUrl: `${baseUrl}/api/phonepe/status?id=${orderId}`,
      mobileNumber: phone || '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const apiPath = '/pg/v1/pay';

    const stringToHash = base64Payload + apiPath + saltKey;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    const response = await fetch('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json',
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();
    console.log('--- PhonePe Pay Response ---', JSON.stringify(data, null, 2));

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({
        success: true,
        url: data.data.instrumentResponse.redirectInfo.url,
      });
    } 
    
    // Dev Local Test Simulation Fallback
    if (!data.success && data.code === 'KEY_NOT_CONFIGURED') {
      console.warn('PhonePe Test Credentials Expired. Redirecting via Local Test Simulator...');
      const simulatedRedirectUrl = `${baseUrl}/api/phonepe/status?id=${orderId}&simulated=true`;
      return NextResponse.json({
        success: true,
        url: simulatedRedirectUrl,
      });
    }

    return NextResponse.json(
      { success: false, message: data.message || 'Payment Initiation Failed' },
      { status: 400 }
    );

  } catch (error) {
    console.error('PhonePe Pay Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
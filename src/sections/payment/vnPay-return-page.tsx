import { useEffect } from 'react';

import { API_URL } from 'src/config-global';

export default function VnPayReturnPage(props: { setPaymentSuccess: (success: boolean) => void }) {
  const { setPaymentSuccess } = props;
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const payload = {
      vnp_TxnRef: params.get('vnp_TxnRef'),
      vnp_ResponseCode: params.get('vnp_ResponseCode'),
      vnp_SecureHash: params.get('vnp_SecureHash'),
      vnp_Amount: parseInt(params.get('vnp_Amount') || '0', 10),
      vnp_OrderInfo: params.get('vnp_OrderInfo'),
    };

    console.log('📦 Sending to backend:', payload);

    fetch(`${API_URL}/payment/vnpay-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log('✅ Thanh toán thành công!');
          setPaymentSuccess(true);
          // redirect user hoặc cập nhật UI
        } else {
          setPaymentSuccess(false);
          console.error('❌ Xác minh thất bại');
        }
      })
      .catch((err) => console.error('🚨 Error verifying payment:', err));
  }, [setPaymentSuccess]);

  return (
    <div className="text-center mt-20">
      <h2 className="text-xl font-bold text-gray-800">Đang xác minh thanh toán...</h2>
    </div>
  );
}

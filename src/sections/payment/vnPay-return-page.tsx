import { useState, useEffect } from 'react';

import { API_URL } from 'src/config-global';

declare const window: any;
type StatusType = 'success' | 'fail' | 'pending' | undefined;
function getPaymentMessage(status: StatusType) {
  if (status === 'success') return 'Thanh toán thành công!';
  if (status === 'fail') return 'Thanh toán thất bại!';
  return 'Đang xác minh thanh toán...';
}

function getPaymentIcon(status: 'success' | 'fail' | 'pending' | undefined) {
  if (status === 'success') {
    return (
      <svg
        className="text-green-500 w-20 h-20 animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === 'fail') {
    return (
      <svg
        className="text-red-500 w-20 h-20 animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }
  return (
    <svg
      className="text-blue-500 w-20 h-20 animate-spin"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" fill="none" />
      <path d="M4 12a8 8 0 018-8" strokeWidth="4" stroke="currentColor" fill="none" />
    </svg>
  );
}

export default function VnPayReturnPage({
  setPaymentSuccess,
}: {
  setPaymentSuccess: (success: boolean) => void;
}) {
  const [status, setStatus] = useState<StatusType>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams(window.location.search);
    const payload = {
      vnp_TxnRef: params.get('vnp_TxnRef'),
      vnp_ResponseCode: params.get('vnp_ResponseCode'),
      vnp_SecureHash: params.get('vnp_SecureHash'),
      vnp_Amount: parseInt(params.get('vnp_Amount') || '0', 10),
      vnp_OrderInfo: params.get('vnp_OrderInfo'),
    };

    fetch(`${API_URL}/payment/vnpay-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted) return;
        if (result.success) {
          setStatus('success');
          setPaymentSuccess(true);
        } else {
          setStatus('fail');
          setPaymentSuccess(false);
          setErrorMsg(result.message || 'Xác minh thất bại');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus('fail');
        setPaymentSuccess(false);
        setErrorMsg('Có lỗi xảy ra khi xác minh thanh toán');
      });
    return () => {
      isMounted = false;
    };
  }, [setPaymentSuccess]);
  const getStatusClass = (inputStatus: StatusType) => {
    switch (inputStatus) {
      case 'success':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="mb-4">{getPaymentIcon(status === 'pending' ? undefined : status)}</div>
      <h2 className={`text-xl font-bold ${getStatusClass(status)}`}>
        {getPaymentMessage(status as StatusType)}
      </h2>
      {status === 'fail' && errorMsg && <div className="mt-2 text-red-500">{errorMsg}</div>}
      {status === 'pending' && (
        <div className="mt-2 text-gray-500">Vui lòng chờ trong giây lát...</div>
      )}
    </div>
  );
}

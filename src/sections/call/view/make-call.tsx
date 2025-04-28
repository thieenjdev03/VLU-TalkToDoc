import { useRef, useState, useEffect } from 'react';

interface CallComponentProps {
  stringeeAccessToken: string;
  fromUserId: string;
}

const CallComponent = ({ stringeeAccessToken, fromUserId }: CallComponentProps) => {
  const [clientConnected, setClientConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stringeeClientRef = useRef<any>(null);

  useEffect(() => {
    if (!stringeeAccessToken) return;

    if (typeof window !== 'undefined' && (window as any).StringeeClient) {
      const { StringeeClient } = window as any;
      const stringeeClient = new StringeeClient();
      stringeeClientRef.current = stringeeClient;

      stringeeClient.connect(stringeeAccessToken);

      stringeeClient.on('connect', () => {
        console.log('Stringee Client connected');
        setClientConnected(true);
      });

      stringeeClient.on('authenerror', (res: any) => {
        console.error('Stringee Authentication Error:', res);
        setError('Authentication error');
      });

      stringeeClient.on('disconnect', () => {
        console.warn('Disconnected from Stringee');
        setClientConnected(false);
      });
    } else {
      console.error('Stringee SDK chưa load');
      setError('Stringee SDK not loaded');
    }
  }, [stringeeAccessToken]);

  if (error) {
    return <div style={{ color: 'red' }}>Lỗi: {error}</div>;
  }

  return (
    <div>
      {clientConnected ? (
        <p>Đã kết nối tới Stringee server</p>
      ) : (
        <p>Đang kết nối tới server Stringee...</p>
      )}
    </div>
  );
};

export default CallComponent;

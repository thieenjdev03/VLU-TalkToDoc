import { useRef, useState, useEffect } from 'react';

// Stringee SDK load bằng <script> bên ngoài
declare const StringeeClient: any;
declare const StringeeCall: any;

interface CallComponentProps {
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: any;
}

export function CallCenter({ stringeeAccessToken, fromUserId, userInfor }: CallComponentProps) {
  const stringeeClientRef = useRef<any>(null);
  const activeCallRef = useRef<any>(null);

  const [clientConnected, setClientConnected] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [toUserId, setToUserId] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState('Chưa bắt đầu');
  const [isVideoCall, setIsVideoCall] = useState(true);

  useEffect(() => {
    if (!stringeeAccessToken) return;

    if (typeof window !== 'undefined' && (window as any).StringeeClient) {
      const client = new (window as any).StringeeClient();
      stringeeClientRef.current = client;

      client.connect(stringeeAccessToken);

      client.on('connect', () => {
        setClientConnected(true);
      });

      client.on('authenerror', (res: any) => {
        setClientConnected(false);
        setCallStatus('Lỗi xác thực');
      });

      client.on('disconnect', () => {
        setClientConnected(false);
        setCallStatus('Mất kết nối');
      });

      client.on('incomingcall', (incomingCallObj: any) => {
        setIncomingCall(incomingCallObj);
        setCallStatus('Có cuộc gọi đến');
      });
    }
  }, [stringeeAccessToken]);

  const makeCall = (video = true) => {
    if (!clientConnected || !toUserId) {
      setCallStatus('Chưa kết nối hoặc thiếu ID người nhận');
      return;
    }
    setIsVideoCall(video);
    const call = new (window as any).StringeeCall(
      stringeeClientRef.current,
      fromUserId,
      toUserId,
      video
    );

    call.makeCall((res: any) => {
      if (res.r === 0) {
        activeCallRef.current = call;
        setCalling(true);
        setCallStatus('Đang gọi...');
      } else {
        setCallStatus(`Gọi thất bại: ${res.message}`);
      }
    });

    call.on('addremotestream', (stream: any) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    });

    call.on('addlocalstream', (stream: any) => {
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
      }
    });

    call.on('signalingstate', (state: any) => {
      setCallStatus(`Trạng thái: ${state.reason}`);
    });
  };

  const endCall = () => {
    if (activeCallRef.current) {
      activeCallRef.current.hangup();
      activeCallRef.current = null;
      setCalling(false);
      setCallStatus('Đã kết thúc cuộc gọi');
    }
  };

  const answerIncomingCall = () => {
    if (incomingCall) {
      incomingCall.answer();
      activeCallRef.current = incomingCall;
      setIncomingCall(null);
      setCalling(true);
      setCallStatus('Đã trả lời cuộc gọi');
    }
  };

  const rejectIncomingCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
      setCallStatus('Đã từ chối cuộc gọi');
    }
  };

  const mute = () => {
    if (activeCallRef.current) {
      activeCallRef.current.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const enableVideo = () => {
    if (activeCallRef.current) {
      activeCallRef.current.enableVideo(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const upgradeToVideoCall = () => {
    if (activeCallRef.current && !isVideoCall) {
      activeCallRef.current.upgradeToVideoCall();
      setIsVideoCall(true);
      setCallStatus('Đã nâng cấp lên video call');
    }
  };

  const switchVoiceVideoCall = () => {
    if (activeCallRef.current) {
      activeCallRef.current.switchVoiceVideoCall();
      setCallStatus('Đã chuyển đổi voice/video');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Login Status */}
      <div className="flex items-center justify-between bg-gray-100 p-4 rounded shadow">
        <div className="flex items-center space-x-4">
          <span className="font-medium">User:</span>
          <span className="text-blue-600">{fromUserId || 'Chưa đăng nhập'}</span>
        </div>
        <div className="text-sm text-gray-500">
          {clientConnected ? 'Đã kết nối Stringee' : 'Đang kết nối...'}
        </div>
      </div>

      {/* Call Actions */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            placeholder="ID người nhận"
            className="border px-4 py-2 rounded w-60"
          />
          <button
            type="button"
            onClick={() => makeCall(false)}
            disabled={!clientConnected || calling}
            className="btn bg-green-500 hover:bg-green-600 text-white"
          >
            Voice Call
          </button>
          <button
            type="button"
            onClick={() => makeCall(true)}
            disabled={!clientConnected || calling}
            className="btn bg-blue-500 hover:bg-blue-600 text-white"
          >
            Video Call
          </button>
          <button
            type="button"
            onClick={endCall}
            disabled={!calling}
            className="btn bg-red-500 hover:bg-red-600 text-white"
          >
            Hang Up
          </button>
        </div>

        {/* Advanced Call Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={upgradeToVideoCall}
            disabled={!calling || isVideoCall}
            className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Upgrade to Video
          </button>
          <button
            type="button"
            onClick={switchVoiceVideoCall}
            disabled={!calling}
            className="btn bg-purple-500 hover:bg-purple-600 text-white"
          >
            Switch Voice/Video
          </button>
          <button
            type="button"
            onClick={mute}
            disabled={!calling}
            className="btn bg-gray-700 hover:bg-gray-800 text-white"
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button
            type="button"
            onClick={enableVideo}
            disabled={!calling}
            className="btn bg-gray-800 hover:bg-gray-900 text-white"
          >
            {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
          </button>
        </div>
      </div>

      {/* Call Status */}
      <div className="text-center text-lg font-semibold text-indigo-600">{callStatus}</div>

      {/* Incoming Call */}
      {incomingCall && (
        <div className="bg-yellow-100 p-4 rounded shadow flex justify-between items-center">
          <span>
            Có cuộc gọi đến từ: <b>{incomingCall.from}</b>
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={answerIncomingCall}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              Trả lời
            </button>
            <button
              type="button"
              onClick={rejectIncomingCall}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Từ chối
            </button>
          </div>
        </div>
      )}

      {/* Video Streams */}
      <div className="grid grid-cols-2 gap-4">
        <video
          id="localVideo"
          playsInline
          autoPlay
          muted
          className="w-full h-64 bg-black rounded"
        />
        <video id="remoteVideo" playsInline autoPlay className="w-full h-64 bg-black rounded">
          <track kind="captions" />
        </video>
      </div>
    </div>
  );
}

export default CallCenter;

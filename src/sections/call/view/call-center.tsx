import { Icon } from '@iconify/react';
import { useRef, useState, useEffect } from 'react';

import { Box, Grid, Paper, Stack, Alert, Button, TextField, Typography } from '@mui/material';
// Stringee SDK load bằng <script> bên ngoài

interface CallComponentProps {
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: any;
}

function CallCenter({ stringeeAccessToken, fromUserId, userInfor }: CallComponentProps) {
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

      client.on('connect', () => setClientConnected(true));
      client.on('authenerror', () => {
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
        remoteVideo.play().catch((err) => console.error('Lỗi phát video từ xa:', err));
      }
    });

    call.on('addlocalstream', (stream: any) => {
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.play().catch((err) => console.error('Lỗi phát video local:', err));
      }
    });

    call.on('addremotetrack', (track: any) => {
      if (track.kind === 'audio') {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        if (remoteVideo) {
          const audioTrack = track.track;
          if (audioTrack) {
            const audioStream = new MediaStream([audioTrack]);
            remoteVideo.srcObject = audioStream;
          }
        }
      }
    });

    call.on('signalingstate', (state: any) => setCallStatus(`Trạng thái: ${state.reason}`));
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

      incomingCall.on('addremotestream', (stream: any) => {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        if (remoteVideo) {
          remoteVideo.srcObject = stream;
          remoteVideo.play().catch((err) => console.error('Lỗi phát video từ xa:', err));
        }
      });

      incomingCall.on('addlocalstream', (stream: any) => {
        const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = stream;
          localVideo.play().catch((err) => console.error('Lỗi phát video local:', err));
        }
      });

      incomingCall.on('addremotetrack', (track: any) => {
        if (track.kind === 'audio') {
          const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
          if (remoteVideo) {
            const audioTrack = track.track;
            if (audioTrack) {
              const audioStream = new MediaStream([audioTrack]);
              remoteVideo.srcObject = audioStream;
            }
          }
        }
      });

      incomingCall.on('signalingstate', (state: any) =>
        setCallStatus(`Trạng thái: ${state.reason}`)
      );

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
  const hiddenContent = false;
  return (
    <Box p={4} maxWidth="1000px" mx="auto">
      {hiddenContent && (
        <>
          <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">User: {fromUserId || 'Chưa đăng nhập'}</Typography>
              <Typography variant="body2" color={clientConnected ? 'green' : 'error'}>
                {clientConnected ? 'Đã kết nối Stringee' : 'Đang kết nối...'}
              </Typography>
            </Stack>
          </Paper>
          <Grid container spacing={2} mb={4}>
            <Grid item>
              <TextField
                label="ID người nhận"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={() => makeCall(false)}
                disabled={!clientConnected || calling}
              >
                Voice Call
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => makeCall(true)}
                disabled={!clientConnected || calling}
              >
                Video Call
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="error" onClick={endCall} disabled={!calling}>
                Hang Up
              </Button>
            </Grid>
          </Grid>

          {/* <Grid container spacing={2} mb={4}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={upgradeToVideoCall}
              disabled={!calling || isVideoCall}
            >
              Upgrade to Video
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={switchVoiceVideoCall} disabled={!calling}>
              Switch Voice/Video
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={mute} disabled={!calling}>
              {isMuted ? 'Tắt Âm thanh' : 'Bật Âm thanh'}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={enableVideo} disabled={!calling}>
              {isVideoEnabled ? 'Tắt Video' : 'Bật Video'}
            </Button>
          </Grid>
        </Grid> */}

          {callStatus && (
            <Alert severity="info" sx={{ mb: 4 }}>
              {callStatus}
            </Alert>
          )}

          {incomingCall && (
            <Alert
              severity="warning"
              sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>
                Có cuộc gọi đến từ: <b>{incomingCall.from}</b>
              </span>
              <Box>
                <Button color="success" onClick={answerIncomingCall}>
                  Trả lời
                </Button>
                <Button color="error" onClick={rejectIncomingCall}>
                  Từ chối
                </Button>
              </Box>
            </Alert>
          )}
        </>
      )}
      <Grid spacing={2}>
        <Grid item xs={6}>
          <video
            id="localVideo"
            playsInline
            autoPlay
            muted
            style={{ width: '100%', height: '300px', background: 'black', borderRadius: '8px' }}
          >
            <track kind="captions" src="captions.vtt" srcLang="en" label="English" default />
          </video>
        </Grid>
        <Stack direction="row" justifyContent="center" marginTop="10px" spacing={3} mb={4}>
          {/* Mic */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '50%',
              backgroundColor: isMuted ? '#f59e0b' : '#3b82f6',
              color: '#fff',
              '&:hover': {
                backgroundColor: isMuted ? '#d97706' : '#2563eb',
              },
            }}
            onClick={mute}
          >
            <Icon icon={isMuted ? 'mdi:microphone-off' : 'mdi:microphone'} width={24} height={24} />
          </Button>

          {/* Camera */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '50%',
              backgroundColor: isVideoEnabled ? '#3b82f6' : '#f59e0b',
              color: '#fff',
              '&:hover': {
                backgroundColor: isVideoEnabled ? '#2563eb' : '#d97706',
              },
            }}
            onClick={enableVideo}
          >
            <Icon icon={isVideoEnabled ? 'mdi:video' : 'mdi:video-off'} width={24} height={24} />
          </Button>

          {/* Chat (placeholder) */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              color: '#111827',
              '&:hover': { backgroundColor: '#d1d5db' },
            }}
          >
            <Icon icon="mdi:chat-outline" width={24} height={24} />
          </Button>

          {/* Record */}
          <Button
            variant="contained"
            sx={{
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' },
            }}
          >
            <Icon icon="mdi:record-circle" width={24} height={24} />
          </Button>

          {/* End Call */}
          <Button
            variant="contained"
            onClick={endCall}
            disabled={!calling}
            sx={{
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
            }}
          >
            <Icon icon="mdi:phone-hangup" width={24} height={24} />
          </Button>
        </Stack>
      </Grid>
    </Box>
  );
}

export default CallCenter;

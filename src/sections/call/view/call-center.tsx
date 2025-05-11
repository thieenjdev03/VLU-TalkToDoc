import { Icon } from '@iconify/react';
import { useRef, useState, useEffect } from 'react';

import { Box, Stack, Alert, Button, Typography } from '@mui/material';

interface CallComponentProps {
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: any;
  currentAppointment: any;
}

export default function CallCenter({
  stringeeAccessToken,
  fromUserId,
  userInfor,
  currentAppointment,
}: CallComponentProps) {
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
  const [openCall, setOpenCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerInfo, setCallerInfo] = useState<any>(null);

  console.log(isVideoCall);
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
        // setCallStatus('Có cuộc gọi đến');
      });
    }
  }, [stringeeAccessToken]);
  console.log('userInfor', userInfor);
  const makeCall = (video = true) => {
    if (!clientConnected || !currentAppointment?.doctor?.id) {
      setCallStatus('Chưa kết nối hoặc thiếu ID người nhận');
      return;
    }
    console.log('currentAppointment', currentAppointment);
    setIsVideoCall(video);
    const callFromId = userInfor?.id;
    const callToId = currentAppointment?.doctor?.id;

    const call = new (window as any).StringeeCall(
      stringeeClientRef.current,
      callFromId,
      callToId,
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
        remoteVideo.onloadedmetadata = () => {
          remoteVideo
            .play()
            .catch((err) => console.error('Lỗi phát video từ xa (sau loadedmetadata):', err));
        };
      }
    });

    call.on('remotestreamremoved', () => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.pause();
        remoteVideo.load();
        remoteVideo.play().catch((err) => console.error('Lỗi phát video từ xa:', err));
      }
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = null;
        localVideo.pause();
        localVideo.load();
        localVideo.play().catch((err) => console.error('Lỗi phát video local:', err));
      }
    });

    call.on('addlocalstream', (stream: any) => {
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.play().catch((err) => console.error('Lỗi phát video local:', err));
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
    if (!incomingCall) return;

    activeCallRef.current = incomingCall;

    activeCallRef.current.on('addlocalstream', (stream: MediaStream) => {
      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.onloadedmetadata = () => {
          localVideo
            .play()
            .catch((err) => console.error('Lỗi phát video local (sau loadedmetadata):', err));
        };
      }
    });

    activeCallRef.current.on('addremotestream', (stream: MediaStream) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.play().catch(console.error);
      }
    });

    activeCallRef.current.answer(); // ✅ CHỈ gọi sau khi đăng ký xong event
    setIncomingCall(null);
    setCalling(true);
    setCallStatus('Đã trả lời cuộc gọi');
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
  const initialPatientName = userInfor?.fullName
    ? userInfor.fullName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
    : 'KH';
  const initialDoctorName = currentAppointment?.doctor?.fullName
    ? currentAppointment?.doctor?.fullName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
    : 'BS';
  return (
    <Box display="flex flex-col gap-2">
      <Box
        bgcolor="#f9fafb"
        p={{ xs: 1, sm: 2 }}
        borderRadius={2}
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 3 }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: { xs: '100%', sm: 120 },
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src="https://res.cloudinary.com/dut4zlbui/image/upload/v1746366836/geiw8b1qgv3w7sia9o4h.png"
            alt="Logo"
            style={{ maxHeight: '50px', objectFit: 'contain' }}
          />
        </Box>

        {/* Divider */}
        <Typography
          variant="h6"
          color="text.disabled"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          |
        </Typography>

        {/* Appointment Info */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} width="100%">
          <Stack spacing={0.5} width={{ xs: '100%', sm: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              Bác sĩ:{' '}
              <Typography component="span" fontWeight="500" color="text.primary">
                {currentAppointment?.doctor?.fullName || '---'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bệnh nhân:{' '}
              <Typography component="span" fontWeight="500" color="text.primary">
                {currentAppointment?.patient?.fullName || '---'}
              </Typography>
            </Typography>
          </Stack>

          <Stack spacing={0.5} width={{ xs: '100%', sm: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              Ngày:{' '}
              <Typography component="span" fontWeight="500" color="text.primary">
                {currentAppointment?.date || '---'}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giờ:{' '}
              <Typography component="span" fontWeight="500" color="text.primary">
                {currentAppointment?.slot || '---'}
              </Typography>
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {/* <Box width="100%" display="flex" flexDirection="column" gap={2} alignItems="center">
        <TextField
          label="Call to"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          sx={{
            mt: 2,
            width: { xs: '100%', sm: '300px' },
            maxWidth: '300px',
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          mt={2}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button variant="contained" onClick={() => makeCall(false)} disabled={!clientConnected}>
            Voice Call
          </Button>
          <Button variant="contained" onClick={() => makeCall(true)} disabled={!clientConnected}>
            Video Call
          </Button>
        </Stack>

        {incomingCall && (
          <Box
            sx={{
              mt: 2,
              px: 3,
              py: 2,
              borderRadius: 4,
              bgcolor: '#333',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '50%',
              boxShadow: 4,
            }}
          >
            <Box>
              <Typography variant="body2" color="gray">
                Cuộc gọi đến
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {incomingCall.from || 'Người gọi'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={answerIncomingCall}
                sx={{
                  bgcolor: 'green',
                  '&:hover': { bgcolor: 'darkgreen' },
                  color: 'white',
                  width: 48,
                  height: 48,
                }}
              >
                <Icon icon="mdi:phone" width={24} height={24} />
              </IconButton>

              <IconButton
                onClick={rejectIncomingCall}
                sx={{
                  bgcolor: 'red',
                  '&:hover': { bgcolor: 'darkred' },
                  color: 'white',
                  width: 48,
                  height: 48,
                }}
              >
                <Icon icon="mdi:phone-hangup" width={24} height={24} />
              </IconButton>

              <IconButton
                sx={{
                  bgcolor: 'gray',
                  '&:hover': { bgcolor: 'darkgray' },
                  color: 'white',
                  width: 48,
                  height: 48,
                }}
              >
                <Icon icon="mdi:email-outline" width={24} height={24} />
              </IconButton>
            </Stack>
          </Box>
        )}
      </Box> */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={{ xs: 2, sm: 4 }}
      >
        <Box
          width="100%"
          borderRadius={2}
          overflow="hidden"
          boxShadow={3}
          position="relative"
          sx={{
            height: { xs: '580px', sm: '580px' },
            backgroundColor: '#000',
          }}
        >
          {/* Remote Video */}
          <Box width="100%" height="100%" sx={{ position: 'relative', zIndex: 1 }}>
            <video
              id="remoteVideo"
              playsInline
              autoPlay
              muted={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#',
              }}
            >
              <track kind="captions" src="" label="English" />
            </video>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: '#424141',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                color: 'white',
                position: 'absolute',
                right: '50%',
                bottom: '50%',
                transform: 'translateX(50%)',
              }}
            >
              {initialDoctorName}
            </Box>
          </Box>

          {/* Local Video - Small preview at bottom right */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: '180px',
              height: '120px',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 3,
              zIndex: 2,
              backgroundColor: '#424141',
            }}
          >
            <Box
              sx={{
                borderRadius: '50%',
                backgroundColor: '#424141',
                position: 'relative',
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                id="localVideo"
                playsInline
                autoPlay
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
              {(callStatus || !isVideoCall) && (
                <Box
                  sx={{
                    backgroundColor: '#424141',
                    fontWeight: 'bold',
                    color: 'white',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      backgroundColor: '#424141',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    {initialPatientName}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        {callStatus && (
          <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
            {callStatus}
          </Alert>
        )}
        <Stack
          direction="row"
          spacing={3}
          mt={4}
          justifyContent="center"
          flexWrap="wrap"
          gap={{ xs: 2, sm: 3 }}
          sx={{
            '& > button': {
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              boxShadow: 2,
              '&:hover': {
                transform: 'scale(1.1)',
                opacity: 0.9,
              },
            },
          }}
        >
          {/* Mic Button */}
          <Button
            variant="contained"
            onClick={mute}
            sx={{
              backgroundColor: isMuted ? 'warning.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isMuted ? 'warning.dark' : 'primary.dark',
              },
            }}
          >
            <Icon icon={isMuted ? 'mdi:microphone-off' : 'mdi:microphone'} width={24} height={24} />
          </Button>

          {/* Camera Button */}
          <Button
            variant="contained"
            onClick={enableVideo}
            sx={{
              backgroundColor: isVideoEnabled ? 'primary.main' : 'warning.main',
              '&:hover': {
                backgroundColor: isVideoEnabled ? 'primary.dark' : 'warning.dark',
              },
            }}
          >
            <Icon icon={isVideoEnabled ? 'mdi:video' : 'mdi:video-off'} width={24} height={24} />
          </Button>

          {/* Chat Button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'grey.200',
              color: 'grey.800',
              '&:hover': {
                backgroundColor: 'grey.300',
              },
            }}
          >
            <Icon icon="mdi:chat-outline" width={24} height={24} />
          </Button>

          {/* Record Button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }}
          >
            <Icon icon="mdi:record-circle" width={24} height={24} />
          </Button>
          {/* Make Call */}
          <Button
            variant="contained"
            onClick={() => makeCall(true)}
            sx={{
              backgroundColor: 'success.main',
              '&:hover': {
                backgroundColor: 'success.dark',
              },
            }}
          >
            <Icon icon="mdi:phone" width={24} height={24} />
          </Button>

          {/* End Call */}
          <Button
            variant="contained"
            onClick={endCall}
            disabled={!calling}
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
              '&.Mui-disabled': {
                backgroundColor: 'grey.300',
                color: 'grey.500',
              },
            }}
          >
            <Icon icon="mdi:phone-hangup" width={24} height={24} />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

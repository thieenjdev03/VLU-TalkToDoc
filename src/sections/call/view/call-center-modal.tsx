import React from 'react';

import { Dialog, IconButton, DialogTitle, DialogContent } from '@mui/material';

import CallCenter from 'src/sections/call/view/call-center';

interface CallCenterModalProps {
  open: boolean;
  onClose: () => void;
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: any;
}

export default function CallCenterModal({
  open,
  onClose,
  stringeeAccessToken,
  fromUserId,
  userInfor,
}: CallCenterModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Gọi điện
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <CallCenter
          stringeeAccessToken={stringeeAccessToken}
          fromUserId={fromUserId}
          userInfor={userInfor}
        />
      </DialogContent>
    </Dialog>
  );
}

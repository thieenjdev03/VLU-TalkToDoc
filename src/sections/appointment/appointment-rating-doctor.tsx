import React, { useState } from 'react'
import { useSnackbar } from 'notistack'

import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import {
  Card,
  Stack,
  Avatar,
  Rating,
  Button,
  Divider,
  TextField,
  Typography
} from '@mui/material'

import { useCallStore } from 'src/store/call-store'
import { submitDoctorRating } from 'src/api/appointment'

interface DoctorRatingProps {
  doctorName: string
  doctorAvatar?: string
  onSubmit: (rating: number, comment: string) => void
  onClose?: () => void // 👈 Tùy chọn
  doctorId: string
  appointmentId: string
}

const ratingLabels: { [index: number]: string } = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời'
}

export default function DoctorRating({
  doctorName,
  doctorAvatar,
  doctorId,
  appointmentId,
  onSubmit,
  onClose
}: DoctorRatingProps) {
  const [rating, setRating] = useState<number | null>(0)
  const [hover, setHover] = useState(-1)
  const [comment, setComment] = useState('')
  const { closeRatingModal } = useCallStore()
  const { enqueueSnackbar } = useSnackbar()
  const handleSubmit = async () => {
    if (rating) {
      try {
        const submit: any = await submitDoctorRating({
          doctorId,
          appointmentId,
          ratingScore: rating,
          description: comment.trim()
        })
        if (submit.status === 200 || !submit.error) {
          setRating(0)
          setComment('')
          closeRatingModal()
          enqueueSnackbar('Đánh giá thành công', {
            variant: 'success'
          })
        } else {
          enqueueSnackbar('Đánh giá thất bại', {
            variant: 'error'
          })
        }
      } catch (error) {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
      }
    }
  }

  return (
    <Card
      sx={{
        p: 4, // padding lớn hơn
        maxWidth: 600, // tăng chiều rộng
        width: 400,
        mx: 'auto',
        borderRadius: 4,
        boxShadow: 6
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Avatar
          src={doctorAvatar || '/assets/images/avatar/avatar_default.jpg'}
          alt={doctorName}
          sx={{ width: 100, height: 100 }} // từ 80 → 100
        />
        <Typography variant="h5" fontWeight={600}>
          Đánh giá bác sĩ {doctorName}
        </Typography>

        <Divider flexItem />

        <Rating
          name="doctor-rating"
          value={rating}
          precision={1}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarBorderIcon fontSize="inherit" />}
          onChange={(event, newValue) => setRating(newValue)}
          onChangeActive={(event, newHover) => setHover(newHover)}
          sx={{ fontSize: 60 }}
        />
        <Typography variant="body1" color="text.secondary">
          {rating
            ? ratingLabels[hover !== -1 ? hover : rating]
            : 'Chọn số sao để đánh giá'}
        </Typography>

        <TextField
          label="Nhận xét (tuỳ chọn)"
          multiline
          rows={4}
          fullWidth
          InputProps={{ sx: { fontSize: 16 } }}
          InputLabelProps={{ sx: { fontSize: 14 } }}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <Stack direction="row" spacing={2} width="100%">
          {onClose && (
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={onClose}
            >
              Đóng
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ py: 1.5, fontSize: 16 }}
          >
            Gửi đánh giá
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}

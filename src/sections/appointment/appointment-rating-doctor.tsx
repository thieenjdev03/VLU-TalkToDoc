import React, { useState } from 'react'

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

interface DoctorRatingProps {
  doctorName: string
  doctorAvatar?: string
  onSubmit: (rating: number, comment: string) => void
  onClose?: () => void // 👈 Tùy chọn
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
  onSubmit,
  onClose
}: DoctorRatingProps) {
  const [rating, setRating] = useState<number | null>(0)
  const [hover, setHover] = useState(-1)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, comment.trim())
      setRating(0)
      setComment('')
    }
  }

  return (
    <Card
      sx={{
        p: 3,
        maxWidth: 480,
        mx: 'auto',
        borderRadius: 3,
        boxShadow: 4
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Avatar
          src={doctorAvatar || '/assets/images/avatar/avatar_default.jpg'}
          alt={doctorName}
          sx={{ width: 80, height: 80 }}
        />
        <Typography variant="h6" fontWeight={600}>
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
          sx={{ fontSize: 40 }}
        />
        <Typography variant="body2" color="text.secondary">
          {rating
            ? ratingLabels[hover !== -1 ? hover : rating]
            : 'Chọn số sao để đánh giá'}
        </Typography>

        <TextField
          label="Nhận xét (tuỳ chọn)"
          multiline
          rows={3}
          fullWidth
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
            disabled={!rating}
            fullWidth
            onClick={handleSubmit}
          >
            Gửi đánh giá
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}

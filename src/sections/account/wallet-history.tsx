import moment from 'moment'
import { useMemo, useState } from 'react'

import Paper from '@mui/material/Paper'
import CardHeader from '@mui/material/CardHeader'
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  InputAdornment
} from '@mui/material'

import { fCurrency } from 'src/utils/format-number'

import Iconify from 'src/components/iconify'

export type WalletTransaction = {
  amount: number
  type: 'DEPOSIT' | 'WITHDRAW' | 'REFUND'
  description: string
  createdAt: string
}

export type WalletHistoryProps = {
  walletBalance: number
  walletHistory: WalletTransaction[]
}

export function WalletHistory({
  walletBalance,
  walletHistory
}: WalletHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const maxItems = 5

  const filteredTransactions = useMemo(
    () =>
      walletHistory
        .filter(tx => {
          const matchesSearch = tx.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
          const txDate = new Date(tx.createdAt)
          const afterStart = startDate ? txDate >= new Date(startDate) : true
          const beforeEnd = endDate ? txDate <= new Date(endDate) : true
          return matchesSearch && afterStart && beforeEnd
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [walletHistory, searchTerm, startDate, endDate]
  )

  const displayTransactions = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, maxItems)

  return (
    <Card>
      <CardHeader title="Lịch sử giao dịch ví" />
      <Stack spacing={2} sx={{ px: 3, pt: 2, pb: 3 }}>
        <Typography variant="h6" color="primary">
          Số dư ví: {fCurrency(walletBalance)}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Tìm kiếm mô tả"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Từ ngày"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        <Divider />

        <Box id="wallet-history-pdf" sx={{ mt: 3 }}>
          {filteredTransactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Không có giao dịch phù hợp
            </Typography>
          ) : (
            <>
              <Stack spacing={1.5}>
                {displayTransactions.map((tx, idx) => {
                  const isNegative = tx.type === 'WITHDRAW'
                  const color = isNegative ? 'error.main' : 'success.main'
                  const bgColor = isNegative
                    ? 'rgba(255, 0, 0, 0.04)'
                    : 'rgba(0, 128, 0, 0.04)'

                  return (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: bgColor,
                        borderLeft: `4px solid ${color}`,
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">
                          {tx.type === 'DEPOSIT' && '💰 Nạp tiền'}
                          {tx.type === 'WITHDRAW' && '🧾 Thanh toán'}
                          {tx.type === 'REFUND' && '↩️ Hoàn tiền'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tx.description}
                        </Typography>
                      </Box>

                      <Stack alignItems="flex-end" spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ color }}>
                          {isNegative ? '-' : '+'}
                          {fCurrency(tx.amount)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(tx.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                      </Stack>
                    </Paper>
                  )
                })}
              </Stack>
              {filteredTransactions.length > maxItems && (
                <Box textAlign="center" mt={1}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowAll(prev => !prev)}
                  >
                    {showAll ? 'Thu gọn' : 'Xem thêm'}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Stack>
    </Card>
  )
}

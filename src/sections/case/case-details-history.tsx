import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Timeline from '@mui/lab/Timeline'
import TimelineDot from '@mui/lab/TimelineDot'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem'

// ----------------------------------------------------------------------

type CaseHistory = {
  orderTime: Date
  paymentTime: Date
  deliveryTime: Date
  completionTime: Date
  timeline: {
    title: string
    time: Date
  }[]
}

type Props = {
  history: CaseHistory
}

export default function CaseDetailsHistory({ history }: Props) {
  const renderTimeline = (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0
        }
      }}
    >
      {history.timeline.map((item, index) => {
        const firstTimeline = index === 0

        const lastTimeline = index === history.timeline.length - 1

        return (
          <TimelineItem key={item.title}>
            <TimelineSeparator>
              <TimelineDot color={(firstTimeline && 'primary') || 'grey'} />
              {lastTimeline ? null : <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Typography variant="subtitle2">{item.title}</Typography>

              <Box
                sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}
              >
                {item.time.toLocaleString('vi-VN')}
              </Box>
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )

  return (
    <Card>
      <CardHeader title="Lịch sử" />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}
      </Stack>
    </Card>
  )
}

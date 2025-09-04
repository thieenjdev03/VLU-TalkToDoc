import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  TextField,
  Typography
} from '@mui/material'

// ----------------------------------------------------------------------

interface KeywordTestResult {
  message: string
  shouldSuggest: boolean
  isFollowUp: boolean
  symptoms: string[]
  detectedKeywords: string[]
}

export default function ChatKeywordDemo() {
  const [testMessage, setTestMessage] = useState('')
  const [testResults, setTestResults] = useState<KeywordTestResult[]>([])

  // Function to detect appointment keywords
  const shouldTriggerAppointmentSuggestion = (message: string): boolean => {
    const appointmentKeywords = [
      'test',           // Test keyword
      'khám',           // Khám bệnh
      'lịch hẹn',       // Đặt lịch hẹn
      'đặt lịch',       // Đặt lịch
      'bác sĩ',         // Tìm bác sĩ
      'tư vấn',         // Tư vấn y tế
      'triệu chứng',    // Có triệu chứng
      'đau',            // Đau đớn
      'sốt',            // Sốt
      'ho',             // Ho
      'mệt mỏi',        // Mệt mỏi
      'tái khám',       // Tái khám
      'khám lại',       // Khám lại
      'hẹn lại',        // Hẹn lại
      'lịch tái khám',  // Lịch tái khám
      'khi nào khám',   // Hỏi lịch khám
      'bao giờ khám',   // Hỏi thời gian khám
      'có cần khám',    // Hỏi có cần khám không
      'có nên khám'     // Hỏi có nên khám không
    ]
    
    const lowerMessage = message.toLowerCase()
    return appointmentKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to detect follow-up appointment keywords
  const shouldTriggerFollowUpSuggestion = (message: string): boolean => {
    const followUpKeywords = [
      'tái khám', 'khám lại', 'hẹn lại', 'lịch tái khám',
      'khi nào khám', 'bao giờ khám', 'có cần khám', 'có nên khám'
    ]
    const lowerMessage = message.toLowerCase()
    return followUpKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  // Function to extract symptoms from message
  const extractSymptoms = (message: string): string[] => {
    const symptoms: string[] = []
    const lowerMessage = message.toLowerCase()
    
    const symptomKeywords = {
      'đau đầu': ['đau đầu', 'nhức đầu'],
      'sốt': ['sốt', 'nóng'],
      'ho': ['ho', 'cough'],
      'mệt mỏi': ['mệt mỏi', 'mệt', 'yếu'],
      'đau bụng': ['đau bụng', 'đau dạ dày'],
      'khó thở': ['khó thở', 'thở khó'],
      'chóng mặt': ['chóng mặt', 'hoa mắt']
    }
    
    Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        symptoms.push(symptom)
      }
    })
    
    return symptoms
  }

  // Function to get detected keywords
  const getDetectedKeywords = (message: string): string[] => {
    const appointmentKeywords = [
      'test', 'khám', 'lịch hẹn', 'đặt lịch', 'bác sĩ', 'tư vấn',
      'triệu chứng', 'đau', 'sốt', 'ho', 'mệt mỏi'
    ]
    
    const lowerMessage = message.toLowerCase()
    return appointmentKeywords.filter(keyword => lowerMessage.includes(keyword))
  }

  const handleTest = () => {
    if (!testMessage.trim()) return

    const result: KeywordTestResult = {
      message: testMessage,
      shouldSuggest: shouldTriggerAppointmentSuggestion(testMessage),
      isFollowUp: shouldTriggerFollowUpSuggestion(testMessage),
      symptoms: extractSymptoms(testMessage),
      detectedKeywords: getDetectedKeywords(testMessage)
    }

    setTestResults(prev => [result, ...prev])
    setTestMessage('')
  }

  const handleClearResults = () => {
    setTestResults([])
  }

  const handleQuickTest = (message: string) => {
    setTestMessage(message)
  }

  const quickTestMessages = [
    'test',
    'Tôi muốn khám bệnh',
    'Đặt lịch hẹn với bác sĩ',
    'Tôi bị đau đầu và sốt',
    'Tôi muốn tái khám',
    'Khi nào tôi nên khám lại?',
    'Xin chào',
    'Tư vấn sức khỏe',
    'Tôi mệt mỏi và ho',
    'Có triệu chứng đau bụng',
    'Hẹn lại lịch khám',
    'Có cần khám không?'
  ]

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Demo: Keyword Detection for Appointment Suggestion
      </Typography>

      {/* Test Input */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test Keyword Detection
        </Typography>
        
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập tin nhắn để test keyword detection..."
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
          />
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={handleTest}
              disabled={!testMessage.trim()}
            >
              Test Message
            </Button>
            <Button
              variant="outlined"
              onClick={handleClearResults}
              disabled={testResults.length === 0}
            >
              Clear Results
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Quick Test Buttons */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Test Messages
        </Typography>
        
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {quickTestMessages.map((message, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => handleQuickTest(message)}
              sx={{ mb: 1 }}
            >
              {message}
            </Button>
          ))}
        </Stack>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Results ({testResults.length})
          </Typography>
          
          <Stack spacing={2}>
            {testResults.map((result, index) => (
              <Card
                key={index}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: result.shouldSuggest ? 'success.main' : 'grey.300',
                  backgroundColor: result.shouldSuggest ? 'success.lighter' : 'grey.50'
                }}
              >
                <Stack spacing={1.5}>
                  {/* Message */}
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    &ldquo;{result.message}&rdquo;
                  </Typography>
                  
                  {/* Should Suggest */}
                  <Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={result.shouldSuggest ? 'Will Suggest Appointment' : 'No Suggestion'}
                        color={result.shouldSuggest ? 'success' : 'default'}
                        size="small"
                      />
                      {result.isFollowUp && (
                        <Chip
                          label="Follow-up"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Stack>
                  </Box>
                  
                  {/* Detected Keywords */}
                  {result.detectedKeywords.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Detected Keywords:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {result.detectedKeywords.map((keyword, idx) => (
                          <Chip
                            key={idx}
                            label={keyword}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  {/* Extracted Symptoms */}
                  {result.symptoms.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Extracted Symptoms:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {result.symptoms.map((symptom, idx) => (
                          <Chip
                            key={idx}
                            label={symptom}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong>
          <br />
          • Type a message and click "Test Message" to see if it will trigger appointment suggestion
          <br />
          • Keywords like &ldquo;test&rdquo;, &ldquo;khám&rdquo;, &ldquo;lịch hẹn&rdquo;, &ldquo;bác sĩ&rdquo;, &ldquo;đau&rdquo;, &ldquo;sốt&rdquo; will trigger suggestions
          <br />
          • Symptoms are automatically extracted from the message
          <br />
          • Use quick test buttons to try common scenarios
        </Typography>
      </Alert>
    </Box>
  )
}

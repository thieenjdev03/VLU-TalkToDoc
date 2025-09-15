import React from 'react'

interface VoiceIntroProps {
  onContinue: () => void
}

export const VoiceIntro: React.FC<VoiceIntroProps> = ({ onContinue }) => {
  const features = [
    {
      icon: '🗣️',
      title: 'Giao tiếp tự nhiên',
      description: 'Cảm nhận và phản hồi với ngắt lời, hài hước và nhiều hơn thế.'
    },
    {
      icon: '🎭',
      title: 'Nhiều giọng nói để lựa chọn',
      description: 'Cung cấp bộ sưu tập giọng nói mở rộng để bạn lựa chọn.'
    },
    {
      icon: '⚙️',
      title: 'Cá nhân hóa theo nhu cầu',
      description: 'Có thể sử dụng trí nhớ và hướng dẫn tùy chỉnh để định hình phản hồi.'
    },
    {
      icon: '🔒',
      title: 'Bạn toàn quyền kiểm soát',
      description: 'Bản ghi âm được lưu trữ và bạn có thể xóa chúng bất cứ lúc nào.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trò chuyện bằng giọng nói cùng AI
            </h1>
            <p className="text-lg text-gray-600">
              Trải nghiệm giao tiếp tự nhiên và thông minh với TalkToDoc
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={onContinue}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Tiếp tục
            </button>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              *Đây là bản mock UI – không thu âm/ gửi dữ liệu thật.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

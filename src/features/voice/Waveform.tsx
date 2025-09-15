import React, { useState, useEffect } from 'react'

interface WaveformProps {
  active: boolean
  className?: string
}

export const Waveform: React.FC<WaveformProps> = ({ active, className = '' }) => {
  const [bars, setBars] = useState<number[]>([])

  useEffect(() => {
    // Initialize bars with random heights
    const initialBars = Array.from({ length: 24 }, () => Math.random() * 0.3 + 0.1)
    setBars(initialBars)

    if (active) {
      const interval = setInterval(() => {
        setBars(prevBars => 
          prevBars.map(() => Math.random() * 0.8 + 0.2)
        )
      }, 150)

      return () => clearInterval(interval)
    }
    
    // Reset to minimal height when inactive
    setBars(Array.from({ length: 24 }, () => 0.1))
    
    return undefined
  }, [active])

  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full transition-all duration-150 ease-in-out"
          style={{
            height: `${height * 100}%`,
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  )
}

import React, { Component, type ReactNode } from 'react'
import { Alert, Box, Typography } from '@mui/material'

// Sử dụng destructuring cho props và state trong render
type SafeRenderProps = {
  children: ReactNode
  fallback?: ReactNode
  errorMessage?: string
}

type SafeRenderState = {
  hasError: boolean
}

// Error Boundary Component
export class SafeRender extends Component<SafeRenderProps, SafeRenderState> {
  constructor(props: SafeRenderProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): SafeRenderState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.warn('SafeRender caught an error:', error, errorInfo)
  }

  render() {
    const { hasError } = this.state
    const { fallback, errorMessage, children } = this.props

    if (hasError) {
      return (
        fallback || (
          <Box sx={{ p: 2 }}>
            <Alert severity="warning">
              <Typography variant="body2">
                {errorMessage || 'Có lỗi xảy ra khi hiển thị dữ liệu'}
              </Typography>
            </Alert>
          </Box>
        )
      )
    }

    return children
  }
}

// Higher Order Component để wrap components
export function withSafeRender<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorMessage?: string
) {
  // Đảm bảo props nhận cả IntrinsicAttributes (fix type error)
  const ComponentWithSafeRender = (props: P) => (
    <SafeRender errorMessage={errorMessage}>
      <WrappedComponent {...props} />
    </SafeRender>
  )
  return ComponentWithSafeRender as React.FC<P>
}

// Utility function để render an toàn
export function safeRender<T>(
  data: T | undefined | null,
  renderFn: (data: T) => ReactNode,
  fallback: ReactNode = null
): ReactNode {
  try {
    if (!data) return fallback
    return renderFn(data)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error in safeRender:', error)
    return fallback
  }
}

// Utility function để access nested properties an toàn
export function safeGet<T>(
  obj: any,
  path: string,
  defaultValue: T
): T {
  try {
    const keys = path.split('.')
    let result = obj

    // Dùng array iteration thay vì for...of
    for (let i = 0; i < keys.length; i + 1) {
      const key = keys[i]
      if (result == null || typeof result !== 'object') {
        return defaultValue
      }
      result = result[key]
    }

    return result !== undefined ? result : defaultValue
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error accessing nested property:', error)
    return defaultValue
  }
}

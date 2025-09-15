import { useResponsive } from 'src/hooks/use-responsive'

// Custom hook for chat-specific responsive behavior
export function useResponsiveChat() {
  const isMobile = useResponsive('down', 'sm')
  const isTablet = useResponsive('between', 'sm', 'md')
  const isDesktop = useResponsive('up', 'md')
  const isLargeDesktop = useResponsive('up', 'lg')

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Chat-specific breakpoints
    showSidebar: isLargeDesktop,
    showCompactSidebar: isTablet,
    hideSidebarOnMobile: isMobile,
    
    // Layout configurations
    chatLayout: {
      direction: isMobile ? 'column' : 'row',
      // eslint-disable-next-line no-nested-ternary
      sidebarWidth: isMobile ? '100%' : (isTablet ? 280 : 320),
      sidebarHeight: isMobile ? '40vh' : '100%',
      mainAreaHeight: isMobile ? '60vh' : '100%'
    },
    
    // Spacing configurations
    spacing: {
      container: isMobile ? 0.5 : 1,
      card: isMobile ? 0 : 1,
      header: isMobile ? 0.5 : 1,
      messages: isMobile ? 1 : 2,
      input: isMobile ? 0.5 : 1
    },
    
    // Size configurations
    sizes: {
      avatar: isMobile ? 32 : 40,
      button: isMobile ? 32 : 40,
      icon: isMobile ? 16 : 20,
      borderRadius: isMobile ? '16px' : '24px',
      minHeight: isMobile ? 44 : 56
    },
    
    // Typography configurations
    typography: {
      title: isMobile ? '1rem' : '1.25rem',
      subtitle: isMobile ? '0.875rem' : '1rem',
      body: isMobile ? '0.8rem' : '0.875rem',
      caption: isMobile ? '0.7rem' : '0.75rem'
    }
  }
}

// Utility function to get responsive values
export function getResponsiveValue<T>(
  mobile: T,
  tablet: T,
  desktop: T,
  isMobile: boolean,
  isTablet: boolean
): T {
  if (isMobile) return mobile
  if (isTablet) return tablet
  return desktop
}

// Utility function for responsive spacing
export function getResponsiveSpacing(
  mobile: number | string,
  tablet: number | string,
  desktop: number | string,
  isMobile: boolean,
  isTablet: boolean
): number | string {
  return getResponsiveValue(mobile, tablet, desktop, isMobile, isTablet)
}

// Utility function for responsive sizing
export function getResponsiveSize(
  mobile: number | string,
  tablet: number | string,
  desktop: number | string,
  isMobile: boolean,
  isTablet: boolean
): number | string {
  return getResponsiveValue(mobile, tablet, desktop, isMobile, isTablet)
}

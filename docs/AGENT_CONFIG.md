# Agent AI Configuration

## 1. System Configuration

```typescript
interface AgentConfig {
  // Model Configuration
  model: {
    name: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };

  // Context Configuration
  context: {
    maxContextLength: number;
    includeFileContents: boolean;
    includeDirectoryStructure: boolean;
    includeRecentChanges: boolean;
  };

  // Response Configuration
  response: {
    format: 'markdown' | 'code' | 'mixed';
    includeExplanations: boolean;
    includeExamples: boolean;
    includeReferences: boolean;
  };

  // Code Style Configuration
  codeStyle: {
    indentation: number;
    quoteStyle: 'single' | 'double';
    semicolons: boolean;
    trailingComma: boolean;
    maxLineLength: number;
  };
}
```

## 2. Default Configuration

```typescript
const defaultConfig: AgentConfig = {
  model: {
    name: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },

  context: {
    maxContextLength: 4000,
    includeFileContents: true,
    includeDirectoryStructure: true,
    includeRecentChanges: true,
  },

  response: {
    format: 'mixed',
    includeExplanations: true,
    includeExamples: true,
    includeReferences: true,
  },

  codeStyle: {
    indentation: 2,
    quoteStyle: 'single',
    semicolons: false,
    trailingComma: true,
    maxLineLength: 80,
  },
};
```

## 3. Feature-Specific Configuration

### Chat System

```typescript
const chatConfig = {
  // Message handling
  messageHandling: {
    maxMessageLength: 1000,
    supportMarkdown: true,
    supportCodeBlocks: true,
    supportImages: false,
  },

  // History management
  historyManagement: {
    maxHistoryLength: 50,
    persistToLocalStorage: true,
    clearOnLogout: true,
  },

  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    showErrorMessages: true,
  },
};
```

### Appointment System

```typescript
const appointmentConfig = {
  // Filtering
  filtering: {
    maxDateRange: 30, // days
    supportedStatuses: ['PENDING', 'CONFIRMED', 'REJECTED'],
    searchFields: ['patient', 'doctor', 'status'],
  },

  // Validation
  validation: {
    minNoticePeriod: 24, // hours
    maxFutureDate: 90, // days
    requiredFields: ['patientId', 'doctorId', 'date', 'slot'],
  },
};
```

### Video Call System

```typescript
const videoCallConfig = {
  // Stringee configuration
  stringee: {
    maxParticipants: 2,
    videoQuality: 'high',
    audioQuality: 'high',
    reconnectAttempts: 3,
  },

  // Media handling
  media: {
    defaultCamera: 'user',
    defaultMicrophone: 'default',
    enableScreenSharing: true,
  },
};
```

## 4. Security Configuration

```typescript
const securityConfig = {
  // Authentication
  authentication: {
    tokenExpiry: 24 * 60 * 60, // 24 hours
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
    maxLoginAttempts: 5,
  },

  // Authorization
  authorization: {
    roles: ['ADMIN', 'DOCTOR', 'PATIENT'],
    permissions: {
      ADMIN: ['*'],
      DOCTOR: ['view_appointments', 'update_appointments', 'video_call'],
      PATIENT: ['view_appointments', 'create_appointments', 'video_call'],
    },
  },

  // Data protection
  dataProtection: {
    encryptLocalStorage: true,
    sanitizeInputs: true,
    validateOutputs: true,
  },
};
```

## 5. Performance Configuration

```typescript
const performanceConfig = {
  // Caching
  caching: {
    enableApiCache: true,
    cacheDuration: 5 * 60, // 5 minutes
    maxCacheSize: 50 * 1024 * 1024, // 50MB
  },

  // Lazy loading
  lazyLoading: {
    enableCodeSplitting: true,
    preloadCriticalComponents: true,
    chunkSize: 200 * 1024, // 200KB
  },

  // Optimization
  optimization: {
    enableMemoization: true,
    enableDebouncing: true,
    enableThrottling: true,
  },
};
```

## 6. Testing Configuration

```typescript
const testingConfig = {
  // Unit testing
  unitTesting: {
    framework: 'jest',
    coverageThreshold: 80,
    testTimeout: 5000,
  },

  // Integration testing
  integrationTesting: {
    framework: 'cypress',
    viewport: { width: 1280, height: 720 },
    videoRecording: true,
  },

  // E2E testing
  e2eTesting: {
    framework: 'playwright',
    browsers: ['chromium', 'firefox', 'webkit'],
    retryAttempts: 2,
  },
};
```

## 7. Logging Configuration

```typescript
const loggingConfig = {
  // Log levels
  levels: {
    error: true,
    warn: true,
    info: true,
    debug: process.env.NODE_ENV === 'development',
  },

  // Log destinations
  destinations: {
    console: true,
    file: true,
    remote: process.env.NODE_ENV === 'production',
  },

  // Log format
  format: {
    timestamp: true,
    level: true,
    message: true,
    metadata: true,
  },
};
```

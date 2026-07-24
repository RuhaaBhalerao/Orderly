# Component Reference Guide

Complete documentation of all Procure AI frontend components.

## Layout Components

### Sidebar
**Location**: `components/layout/Sidebar.tsx`

A fixed left sidebar with navigation menu.

**Features**:
- Logo with branding
- Navigation items with active states
- User profile section
- Logout button

**Props**: None (uses hooks internally)

**Usage**:
```tsx
<Sidebar />
```

### Header
**Location**: `components/layout/Header.tsx`

Top navigation bar with Gmail status and sync button.

**Features**:
- Welcome message
- Gmail connection status
- Sync Inbox button with loading state
- Profile avatar

**Props**: None (uses hooks internally)

**Usage**:
```tsx
<Header />
```

---

## Dashboard Components

### KPICard
**Location**: `components/dashboard/KPICard.tsx`

Displays a key performance indicator with metric value.

**Props**:
```typescript
interface KPICardProps {
  label: string           // KPI name
  value: number           // Metric value
  subtitle?: string       // Optional subtitle
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  icon?: React.ReactNode  // Optional custom icon
}
```

**Usage**:
```tsx
<KPICard
  label="Contracts Imported"
  value={24}
  subtitle="+6 this week"
  trend={{ value: 6, direction: 'up' }}
/>
```

---

## Contract Components

### ContractTable
**Location**: `components/contracts/ContractTable.tsx`

Table displaying list of contracts with filtering.

**Props**:
```typescript
interface ContractTableProps {
  contracts: Contract[]      // List of contracts
  showPagination?: boolean   // Show pagination controls
}
```

**Features**:
- Vendor logo/name
- Contract subject and type
- Received date
- Status badge
- Risk badge
- Review button

**Usage**:
```tsx
<ContractTable
  contracts={mockContracts}
  showPagination={true}
/>
```

---

## Chat Components

### ChatMessage
**Location**: `components/chat/ChatMessage.tsx`

Single chat message bubble (user or AI).

**Props**:
```typescript
interface ChatMessageProps {
  message: ChatMessage  // Message object with type, content, timestamp
}
```

**Features**:
- User/AI message differentiation
- Avatar with initials
- Message content
- Timestamp display

**Usage**:
```tsx
<ChatMessage
  message={{
    id: '1',
    type: 'user',
    content: 'What are the terms?',
    timestamp: new Date()
  }}
/>
```

---

## Shared Components

### Card
**Location**: `components/shared/Card.tsx`

Composable card container with flexible sections.

**Components**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Props**:
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  border?: boolean        // Show border (default: true)
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean        // Bottom border (default: true)
}
```

**Usage**:
```tsx
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

### Badge
**Location**: `components/shared/Badge.tsx`

Small badge or label component.

**Props**:
```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}
```

**Variants**:
- `default` - Gray background
- `success` - Green background
- `warning` - Amber background
- `danger` - Red background
- `info` - Blue background

**Usage**:
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="danger">Expired</Badge>
```

### RiskBadge
**Location**: `components/shared/RiskBadge.tsx`

Risk level indicator badge.

**Props**:
```typescript
interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high' | null
  className?: string
}
```

**Features**:
- Color-coded by severity
- Icon indicators
- Text labels

**Usage**:
```tsx
<RiskBadge risk="high" />      // Red with AlertTriangle
<RiskBadge risk="medium" />    // Amber with AlertCircle
<RiskBadge risk="low" />       // Green with Info
<RiskBadge risk={null} />      // Gray dash
```

### StatusBadge
**Location**: `components/shared/StatusBadge.tsx`

Processing status indicator badge.

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'processed' | 'processing' | 'failed'
  className?: string
}
```

**Features**:
- CheckCircle for processed
- Clock for processing
- AlertCircle for failed

**Usage**:
```tsx
<StatusBadge status="processed" />
<StatusBadge status="processing" />
<StatusBadge status="failed" />
```

### Toast
**Location**: `components/ui/Toast.tsx`

Toast notification system.

**Props**: None (uses ToastProvider context)

**Usage**:
```tsx
import { useToast } from '@/lib/toast'

export function MyComponent() {
  const { addToast } = useToast()

  const handleClick = () => {
    addToast('Success message', 'success')
    addToast('Error message', 'error')
    addToast('Warning message', 'warning')
    addToast('Info message', 'info')
  }

  return <button onClick={handleClick}>Show Toast</button>
}
```

---

## Utility Functions

### From `lib/utils.ts`

#### cn()
Merge Tailwind classes safely.

```typescript
cn('px-4', false && 'py-2', 'text-white')
// Result: 'px-4 text-white'
```

#### formatDate()
Format date with relative time labels.

```typescript
formatDate(new Date())           // "Today 2:30 PM"
formatDate(new Date() - 86400)   // "Yesterday 3:15 PM"
formatDate(new Date('2025-05-26')) // "May 26, 2025"
```

#### getRiskColor()
Get Tailwind text color class for risk level.

```typescript
getRiskColor('high')     // 'text-red-600'
getRiskColor('medium')   // 'text-amber-600'
getRiskColor('low')      // 'text-emerald-600'
```

#### getStatusColor()
Get Tailwind text color class for status.

```typescript
getStatusColor('processed')    // 'text-emerald-600'
getStatusColor('processing')   // 'text-blue-600'
getStatusColor('failed')       // 'text-red-600'
```

---

## Types

### From `types/index.ts`

```typescript
export type ContractStatus = 'processed' | 'processing' | 'failed'
export type RiskLevel = 'low' | 'medium' | 'high' | null
export type MessageType = 'user' | 'ai'

interface Contract {
  id: string
  vendor: string
  vendorLogo?: string
  subject: string
  contractType: string
  status: ContractStatus
  risk: RiskLevel
  received: string
  receivedDate: Date
  effectiveDate: string
  expiryDate: string
  paymentTerms: string
  renewal: string
  terminationNotice: string
  summary: string[]
  risks: RiskItem[]
}

interface RiskItem {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
  location: string
  recommendation: string
}

interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: Date
}

interface User {
  id: string
  name: string
  email: string
  title: string
  company: string
  avatar: string
  gmailConnected: boolean
  gmailEmail?: string
  lastSync?: string
}

interface KPI {
  label: string
  value: number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}
```

---

## Hooks

### useToast()
**Location**: `lib/toast.tsx`

Provides toast notification functionality.

```typescript
const { toasts, addToast, removeToast } = useToast()

// Add toast
addToast('Message', 'success', 3000)

// Remove specific toast
removeToast(toastId)
```

**Toast Types**:
- `'success'` - Green
- `'error'` - Red
- `'warning'` - Amber
- `'info'` - Blue

---

## Page Layouts

### Dashboard Layout
**Location**: `app/(dashboard)/layout.tsx`

Wraps all dashboard pages with Sidebar + Header.

### Login Page
**Location**: `app/page.tsx`

Standalone page (not wrapped by dashboard layout).

### Dashboard Page
**Location**: `app/(dashboard)/dashboard/page.tsx`

Main dashboard with KPIs and recent contracts.

### Contracts List
**Location**: `app/(dashboard)/contracts/page.tsx`

Full contracts list with search and filtering.

### Contract Details
**Location**: `app/(dashboard)/contracts/[id]/page.tsx`

Single contract with summary, fields, risks, and chat.

### Settings
**Location**: `app/(dashboard)/settings/page.tsx`

User settings and preferences.

### Chat
**Location**: `app/(dashboard)/chat/page.tsx`

General AI chat interface.

---

## Mock Data

### mockContracts
**Location**: `data/mockContracts.ts`

5 sample contracts with complete data.

**Functions**:
- `getContractById(id)` - Get single contract
- `getRecentContracts(limit)` - Get recent contracts

### mockKPIs
**Location**: `data/mockKPIs.ts`

Dashboard KPI metrics (4 items).

### mockChatHistory
**Location**: `data/mockChat.ts`

Chat message history (4 messages).

### mockUser
**Location**: `data/mockUser.ts`

Current user information.

---

## Styling System

### Tailwind Config
**Location**: `tailwind.config.ts`

Custom color scheme and utilities.

**Colors**:
- `primary: #6366f1`
- `primary-dark: #4f46e5`
- `sidebar: #1e293b`

### Global Styles
**Location**: `app/globals.css`

Global CSS rules and animations.

### Component Styles

All components use Tailwind CSS utility classes for styling.

---

## Component Composition Example

```tsx
'use client'

import { Card, CardHeader, CardContent } from '@/components/shared/Card'
import { RiskBadge } from '@/components/shared/RiskBadge'
import { Badge } from '@/components/shared/Badge'

export function ContractCardExample() {
  return (
    <Card>
      <CardHeader border={true}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Microsoft Agreement</h3>
          <RiskBadge risk="medium" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-2">
          12-month enterprise software agreement
        </p>
        <div className="flex gap-2">
          <Badge variant="info">Net 30</Badge>
          <Badge variant="warning">Auto-renewal</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Best Practices

### Use Composition
```tsx
// ✅ Good
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid
<Card header="Title" content="Content" />
```

### Use TypeScript Types
```typescript
// ✅ Good
const contracts: Contract[] = mockContracts

// ❌ Avoid
const contracts = mockContracts
```

### Use Utility Functions
```typescript
// ✅ Good
import { cn, formatDate } from '@/lib/utils'

// ❌ Avoid
const className = classes.join(' ')
```

### Use Context for State
```typescript
// ✅ Good
const { addToast } = useToast()

// ❌ Avoid
// Prop drilling through 5 components
```

---

## Performance Tips

- Use `'use client'` for interactive components
- Memoize callbacks with `useCallback`
- Lazy load heavy components with `dynamic()`
- Use Next.js Image optimization
- Avoid inline function definitions

---

## Accessibility

- Use semantic HTML (`<button>`, `<form>`, etc.)
- Add ARIA labels to icons
- Ensure color contrast (WCAG AA)
- Support keyboard navigation
- Include focus states

---

## Common Patterns

### Form Handling
```tsx
const [value, setValue] = useState('')

const handleChange = (e) => setValue(e.target.value)
const handleSubmit = (e) => {
  e.preventDefault()
  // Handle submission
}
```

### Data Fetching (Future)
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetch('/api/data')
    .then(r => r.json())
    .then(d => setData(d))
    .finally(() => setLoading(false))
}, [])
```

### Navigation
```tsx
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/contracts')
router.back()
```

---

**Component Reference Version**: 1.0  
**Last Updated**: July 2025

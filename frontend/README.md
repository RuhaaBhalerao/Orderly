# Procure AI - Frontend

A production-quality Next.js frontend for the Procure AI contract intelligence platform.

## Features

- **Modern UI Design** - Enterprise-grade, clean, and spacious interface
- **Complete Pages**
  - Login page with demo credentials
  - Dashboard with KPI cards and contract overview
  - Contract details with AI summary, extracted fields, and identified risks
  - Chat interface for asking questions about contracts
  - Contracts listing with search and filtering
  - Settings page for Gmail integration and preferences
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Mock Data** - All data is hardcoded for demo purposes
- **Component Architecture** - Reusable, modular components
- **TypeScript** - Full type safety throughout
- **Toast Notifications** - User feedback system
- **Production Ready** - Professional code quality and best practices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui patterns
- **Icons**: Lucide React
- **State Management**: React hooks + Context API

## Project Structure

```
frontend/
├── app/                           # Next.js app directory
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── layout.tsx            # Sidebar + Header layout
│   │   ├── dashboard/
│   │   ├── contracts/
│   │   │   └── [id]/            # Contract details
│   │   ├── settings/
│   │   └── chat/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Login page
│
├── components/
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── dashboard/                # Dashboard components
│   │   └── KPICard.tsx
│   ├── contracts/                # Contract components
│   │   └── ContractTable.tsx
│   ├── chat/                     # Chat components
│   │   └── ChatMessage.tsx
│   ├── shared/                   # Shared components
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Toast.tsx
│   └── ui/
│
├── data/                         # Mock data
│   ├── mockChat.ts
│   ├── mockContracts.ts
│   ├── mockKPIs.ts
│   └── mockUser.ts
│
├── lib/
│   ├── toast.tsx                 # Toast context and hook
│   └── utils.ts                  # Utility functions
│
├── types/                        # TypeScript types
│   └── index.ts
│
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local .env.local

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=Procure AI
```

## Usage

### Login

- Navigate to `http://localhost:3000`
- Use demo credentials:
  - Email: `demo@acme.com`
  - Password: `demo`

### Dashboard

- View KPI cards summarizing contract metrics
- See recent contracts with status and risk indicators
- Click "Sync Inbox" to simulate inbox synchronization
- Click "Review" on any contract to view details

### Contract Details

- View AI-generated summary
- Review extracted contract fields
- Check identified risks and recommendations
- Ask questions using the AI chat interface
- Simulate chat interactions

### Contracts

- View all contracts
- Search by vendor or contract name
- Filter by status or risk level
- Navigate to contract details

### Settings

- Manage Gmail connection (simulated)
- Configure notification preferences
- Access security settings
- Account management

## Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Login Page | User authentication |
| `/dashboard` | Dashboard | Main dashboard with KPIs |
| `/contracts` | Contracts List | All contracts with filtering |
| `/contracts/[id]` | Contract Details | Single contract details |
| `/settings` | Settings | User preferences |
| `/chat` | Chat | General AI chat interface |

## Mock Data

All data is stored in `/data` and is hardcoded. When connected to the backend:

- Replace mock data calls with API calls
- Update components to use real data
- Connect to PostgreSQL via Spring Boot
- Integrate with Gmail API
- Connect to FastAPI AI service

### Key Mock Data Files

- **mockContracts.ts** - Contract list and details
- **mockChatHistory.ts** - Chat message history
- **mockUser.ts** - Current user information
- **mockKPIs.ts** - Dashboard KPI metrics

## Component Documentation

### Layout Components

**Sidebar**
- Navigation menu
- User profile section
- Logout button
- Active route highlighting

**Header**
- Welcome message
- Gmail status indicator
- Sync Inbox button
- Profile avatar

### Dashboard Components

**KPICard**
- Displays metric with value
- Optional trend indicator
- Icon support
- Responsive design

### Shared Components

**Card, CardHeader, CardContent, CardFooter**
- Composable card layout
- Border and shadow options
- Flexible styling

**RiskBadge / StatusBadge**
- Visual indicators for risk level
- Status state display
- Color-coded severity

**Badge**
- Versatile badge component
- Multiple variants
- Flexible styling

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Design System

### Colors

- **Primary**: `#6366f1` (Indigo)
- **Primary Dark**: `#4f46e5`
- **Sidebar**: `#1e293b` (Dark Blue)
- **Success**: Emerald
- **Warning**: Amber
- **Danger**: Red
- **Info**: Blue

### Typography

- **Font**: System fonts (sans-serif)
- **Headings**: Bold (700)
- **Body**: Regular (400)
- **Code**: Monospace

### Spacing

- **Small**: 4px / 8px
- **Medium**: 16px / 24px
- **Large**: 32px / 48px

### Shadows

- **Card**: `0 1px 3px 0 rgb(0 0 0 / 0.1)`
- **Elevated**: `shadow-lg`

## Performance Optimizations

- ✅ Image optimization (Next.js)
- ✅ Code splitting (Next.js)
- ✅ CSS optimization (Tailwind)
- ✅ Efficient re-renders (React)
- ✅ Lazy loading (planned)
- ✅ Compression (server)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation
- ✅ Color contrast compliance
- ✅ Focus management

## Future Enhancements

- [ ] Dark mode support
- [ ] Internationalization (i18n)
- [ ] Advanced charting
- [ ] Real-time updates (WebSocket)
- [ ] File upload for PDFs
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Custom dashboards
- [ ] User preferences storage

## Backend Integration

To connect to the actual backend:

1. Update API calls in components
2. Replace mock data with API requests
3. Implement proper error handling
4. Add loading states
5. Implement caching strategy
6. Add authentication flow
7. Connect to real database

Example API integration:

```typescript
// Before: Mock data
import { mockContracts } from '@/data/mockContracts'

// After: API call
const response = await fetch('/api/contracts')
const contracts = await response.json()
```

## Contributing

- Follow TypeScript strict mode
- Use functional components with hooks
- Keep components modular and reusable
- Write clean, descriptive code
- Use proper error handling
- Add comments for complex logic
- Test on different screen sizes

## License

MIT

---

**Project Status**: MVP (Minimum Viable Product)  
**Last Updated**: July 2025  
**Version**: 1.0.0

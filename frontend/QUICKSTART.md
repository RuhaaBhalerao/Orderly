# Quick Start Guide - Procure AI Frontend

## Get Running in 2 Minutes

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

---

## Demo Walkthrough

### 1. Login

```
Email: demo@acme.com
Password: demo
```

Or use any email/password combination.

### 2. Dashboard

- ✅ View 4 KPI cards with metrics
- ✅ See recent contracts in a table
- ✅ Click "Sync Inbox" (shows success toast)
- ✅ View contract statistics

### 3. View a Contract

- Click "Review" on any contract
- See AI summary, extracted fields, and identified risks
- Read chat history and ask questions
- Type in chat box and hit Enter to simulate responses

### 4. Contracts Page

- View all 5 sample contracts
- Search by vendor name
- Filter by status or risk level
- Click Review to see contract details

### 5. Settings

- See Gmail connection status
- Try "Reconnect" and "Disconnect" (shows toasts)
- Browse other settings

### 6. Logout

- Click logout in sidebar
- Returns to login page

---

## File Structure

```
frontend/
├── app/                    # Pages and layouts
├── components/            # Reusable components
├── data/                  # Mock data
├── lib/                   # Utilities and context
├── types/                 # TypeScript types
└── public/               # Static files
```

---

## Key Pages

| URL | Purpose |
|-----|---------|
| `/` | Login page |
| `/dashboard` | Main dashboard (KPIs, recent contracts) |
| `/contracts` | Full contracts list with search/filter |
| `/contracts/[id]` | Contract details, summary, chat |
| `/settings` | User settings and preferences |
| `/chat` | General AI chat interface |

---

## What's Included

✅ **100% Responsive** - Works on desktop, tablet, mobile  
✅ **Mock Data** - All hardcoded, no backend needed  
✅ **Toast Notifications** - User feedback system  
✅ **Component Library** - 15+ reusable components  
✅ **TypeScript** - Full type safety  
✅ **Clean Architecture** - Feature-based folder structure  
✅ **Production Ready** - Enterprise-quality code  

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Design Philosophy

The UI follows modern SaaS design principles:

- **Clean** - Minimal, spacious layout
- **Professional** - Enterprise-grade appearance
- **Intuitive** - Clear navigation and structure
- **Accessible** - Semantic HTML, ARIA labels
- **Responsive** - Works on all screen sizes

---

## Customization

### Change Primary Color

Edit `tailwind.config.ts`:

```typescript
extend: {
  colors: {
    primary: '#YOUR_COLOR',
    'primary-dark': '#YOUR_COLOR_DARK',
  },
}
```

### Add New Page

1. Create file: `app/(dashboard)/yourpage/page.tsx`
2. Add route to Sidebar: `components/layout/Sidebar.tsx`
3. Create components as needed

### Modify Mock Data

Edit files in `data/` folder:

- `mockContracts.ts` - Contract list
- `mockKPIs.ts` - Dashboard metrics
- `mockChat.ts` - Chat messages
- `mockUser.ts` - User information

---

## Important Notes

⚠️ **No Backend Needed** - This frontend works standalone with hardcoded data  
⚠️ **No Database** - All data is in-memory  
⚠️ **No APIs Integrated** - Ready for backend connection  
⚠️ **Demo Only** - Don't send real emails or data  

---

## Next Steps

1. ✅ Explore the UI - Click around, test all pages
2. ✅ Review code structure - Understand component organization
3. ✅ Read `README.md` - Full documentation
4. ✅ Customize - Change colors, text, mock data as needed
5. ✅ Backend Integration - Connect to Spring Boot API when ready

---

## Need Help?

- Check `README.md` for detailed documentation
- Review component files for implementation examples
- Look at `data/` folder for mock data structure
- Check `lib/utils.ts` for utility functions

---

**Happy Developing!** 🚀

For questions or issues, refer to the main `README.md` file.

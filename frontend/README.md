# WanderWild AI Chatbot System - Frontend

A modern, responsive frontend for the WanderWild AI Chatbot System built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **AI-Powered Chatbot Interface** - Interactive chat with travel recommendations
- **Multi-Role Authentication** - Customer, Agency, and Admin dashboards
- **Package Management** - Browse, search, and book travel packages
- **Responsive Design** - Mobile-first approach with dark mode support
- **Modern UI/UX** - Beautiful animations and smooth interactions
- **State Management** - Zustand for efficient state handling
- **Form Validation** - React Hook Form with Zod validation

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📁 Project Structure

```
/app
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── InputField.tsx
│   ├── ChatBubble.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── PackageCard.tsx
├── dashboard/          # Role-based dashboards
│   ├── customer/
│   ├── agency/
│   └── admin/
├── packages/           # Package listing and details
│   ├── page.tsx
│   └── [id]/page.tsx
├── chatbot/           # AI chatbot interface
├── login/             # Authentication pages
├── register/
├── utils/             # Utilities and data
│   ├── api.ts
│   ├── store.ts
│   └── dummyData.ts
├── globals.css        # Global styles
├── layout.tsx         # Root layout
└── page.tsx          # Home page
```

## 🎯 User Roles

### Customer
- Browse and search travel packages
- Chat with AI for recommendations
- Book packages and manage bookings
- View chat history and saved packages

### Travel Agency
- Manage travel packages (CRUD operations)
- View bookings and customer interactions
- Access analytics and performance metrics
- Upload and edit package details

### Admin
- Oversee platform operations
- Manage users and agencies
- Monitor system analytics
- Review and approve packages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wanderwild-ai-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Pages & Features

### Home Page (`/`)
- Hero section with call-to-action buttons
- Feature highlights and statistics
- Modern design with animations

### Chatbot (`/chatbot`)
- Interactive AI chat interface
- Message history with timestamps
- Quick action buttons
- Mock API integration ready

### Packages (`/packages`)
- Grid layout of travel packages
- Advanced filtering and search
- Price range and category filters
- Responsive package cards

### Package Details (`/packages/[id]`)
- Detailed package information
- Image gallery
- Itinerary and highlights
- Booking interface

### Authentication (`/login`, `/register`)
- Role-based registration
- Form validation with error handling
- Social login options (UI ready)
- Secure authentication flow

### Dashboards
- **Customer**: Bookings, chat history, saved packages
- **Agency**: Package management, bookings, analytics
- **Admin**: User management, platform oversight, analytics

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #8b5cf6)
- **Sand**: Warm travel theme (#fdfcfb to #654e36)
- **Sky**: Light blue accents (#f0f9ff to #0c4a6e)

### Components
- Consistent button styles with hover effects
- Card-based layouts with shadows
- Form inputs with focus states
- Responsive navigation

### Dark Mode
- Automatic theme switching
- Consistent color scheme
- Smooth transitions

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Tailwind Configuration
Custom theme with travel-inspired colors and animations in `tailwind.config.js`.

## 📦 API Integration

The project includes a complete API client (`app/utils/api.ts`) with:
- Authentication endpoints
- Chat/messaging APIs
- Package management
- User management
- File upload handling
- Analytics endpoints

## 🧪 State Management

Zustand stores for:
- **Auth**: User authentication and profile
- **Chat**: Message history and conversations
- **Packages**: Package data and favorites
- **Theme**: Dark/light mode preferences

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🔮 Future Enhancements

- Real-time chat with WebSocket integration
- Payment processing integration
- Advanced analytics dashboard
- Mobile app development
- Multi-language support
- Advanced search with AI

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

Built with ❤️ by the WanderWild AI Team

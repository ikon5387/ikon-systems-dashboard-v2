# Ikon Systems Dashboard v2.0.0

🚀 **Ultimate Webapp Upgrade** - A comprehensive business management dashboard with full API integrations, built with React, TypeScript, and Supabase.

## ✨ What's New in v2.0.0

### 🔗 Complete API Integrations
- **Google Calendar**: Full calendar sync and event management
- **Stripe**: Comprehensive payment analytics and customer management  
- **VAPI**: AI voice agent management and call history
- **Twilio**: Phone number management and SMS capabilities

### 🛡️ Production-Ready Features
- **Error Boundaries**: Graceful error handling and recovery
- **Maintenance Mode**: System maintenance notifications
- **Environment Management**: Secure API key handling
- **Enhanced Security**: Production-grade security measures

## 🚀 Features

### Core Functionality
- **Client Management**: Complete CRUD operations for client data
- **Project Management**: Track projects with status, priority, and timeline
- **Appointment Scheduling**: Manage appointments with Google Calendar integration
- **Voice Agents**: AI-powered voice agent management with VAPI integration
- **Financial Management**: Invoice, payment, and expense tracking with Stripe analytics
- **Phone Numbers**: Twilio SMS and phone number management
- **Analytics Dashboard**: Comprehensive business analytics and reporting

### Technical Features
- **Real-time Updates**: Live data synchronization using Supabase Realtime
- **Dark Mode**: Complete dark theme support
- **Responsive Design**: Mobile-first responsive design
- **Type Safety**: Full TypeScript implementation
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **Error Handling**: Comprehensive error boundaries and handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Chart.js** for data visualization
- **Framer Motion** for animations

### Backend
- **Supabase** (PostgreSQL, Auth, Realtime, Storage)
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates

### Integrations
- **Google Calendar** for appointment sync and event management
- **VAPI** for AI voice agent management and call history
- **Stripe** for payment processing and analytics
- **Twilio** for SMS/communication and phone number management

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/your-username/ikon-systems-dashboard.git
cd ikon-systems-dashboard
npm install
```

### 2. Environment Setup
Copy the environment template and configure your API keys:
```bash
cp .env.example .env.local
```

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_VAPI_API_KEY` - Your VAPI API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `VITE_GOOGLE_CALENDAR_CLIENT_ID` - Your Google Calendar client ID
- `VITE_TWILIO_ACCOUNT_SID` - Your Twilio account SID
- `VITE_TWILIO_AUTH_TOKEN` - Your Twilio auth token

### 3. Run Development Server
```bash
npm run dev
```

### 4. Production Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Integration Setup Guide](./INTEGRATION_SETUP_GUIDE.md)** - API integration configuration
- **[Production Configuration](./PRODUCTION_CONFIG.md)** - Production environment setup
- **[Changelog](./CHANGELOG.md)** - Version history and changes

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── charts/         # Chart components
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   ├── clients/        # Client management
│   ├── projects/       # Project management
│   ├── appointments/   # Appointment management
│   ├── voice-agents/   # Voice agent management
│   ├── financials/     # Financial management
│   └── analytics/      # Analytics and reporting
├── services/           # Business logic and API services
│   ├── base/           # Base service classes
│   ├── auth/           # Authentication service
│   ├── clients/        # Client service
│   ├── projects/       # Project service
│   ├── appointments/   # Appointment service
│   ├── voice-agents/   # Voice agent service
│   ├── financials/     # Financial service
│   ├── analytics/      # Analytics service
│   └── integrations/   # Third-party integrations
├── lib/                # Utilities and configuration
└── test/               # Test setup and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ikonsystemsdash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_APP_NAME=Ikon Systems Dashboard
   VITE_APP_VERSION=1.0.0
   ```

4. **Database Setup**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image**
   ```bash
   docker-compose -f docker-compose.simple.yml build
   ```

2. **Run the application**
   ```bash
   docker-compose -f docker-compose.simple.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Environment Variables for Docker

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Ikon Systems Dashboard
VITE_APP_VERSION=1.0.0
```

## 📊 Database Schema

The application uses the following main tables:

- **users**: User accounts and roles
- **clients**: Client information and status
- **projects**: Project details, status, and timeline
- **appointments**: Scheduled appointments and meetings
- **voice_agents**: AI voice agent configurations
- **invoices**: Invoice management
- **payments**: Payment tracking
- **expenses**: Expense management
- **financials**: Financial records
- **settings**: Application settings

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Husky** for git hooks

### Testing

```bash
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Ensure all environment variables are properly set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`

### Docker Production Deployment

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 Features Overview

### Dashboard
- Real-time metrics and KPIs
- MRR (Monthly Recurring Revenue) chart
- Recent activity feed
- Quick action buttons

### Client Management
- Complete client profiles
- Status tracking (Lead, Prospect, Active, Churned)
- Contact information management
- Notes and history

### Project Management
- Project lifecycle tracking
- Priority and status management
- Budget and timeline tracking
- Milestone management

### Appointment Scheduling
- Calendar integration
- Google Calendar sync
- Status tracking
- Automated reminders

### Voice Agents
- AI agent configuration
- Performance metrics
- Call management
- Integration with VAPI

### Financial Management
- Invoice generation and tracking
- Payment processing
- Expense management
- Financial reporting

### Analytics
- Business performance metrics
- Revenue tracking
- Client growth analysis
- Project success rates

## 🔐 Security

- **Row Level Security** (RLS) enabled on all tables
- **Authentication** via Supabase Auth
- **Environment variables** for sensitive data
- **Input validation** with Zod schemas
- **Error boundaries** for graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: contact@ikonsystemsai.com

## 🔄 Updates

### Version 1.0.0
- Initial release with core functionality
- Complete CRUD operations for all entities
- Real-time updates
- Dark mode support
- Docker deployment ready
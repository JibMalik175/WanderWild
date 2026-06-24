# WanderWild Backend API

A comprehensive backend API for the WanderWild travel platform built with Node.js, Express, and Supabase.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Multi-role system (Customer, Agency, Admin)
- **Package Management**: Full CRUD operations with categories and availability
- **Booking System**: Complete booking flow with payment processing
- **Review System**: Customer reviews and ratings
- **AI Features**: Chat sessions and itinerary generation
- **Inquiry System**: Customer-agency communication
- **VR Experiences**: Virtual reality booking system
- **Analytics**: Comprehensive reporting and analytics
- **File Upload**: Image and document handling
- **Rate Limiting**: API protection and throttling
- **Security**: Helmet, CORS, and input validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Logging**: Morgan
- **Compression**: Gzip compression

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/status` - Update user status (Admin)
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/bookings` - Get user bookings
- `GET /api/users/:id/reviews` - Get user reviews

### Agencies
- `GET /api/agencies` - Get all agencies
- `GET /api/agencies/:id` - Get agency by ID
- `POST /api/agencies` - Create new agency
- `PUT /api/agencies/:id` - Update agency
- `DELETE /api/agencies/:id` - Delete agency
- `PUT /api/agencies/:id/verification` - Update verification status (Admin)
- `GET /api/agencies/:id/packages` - Get agency packages
- `GET /api/agencies/:id/stats` - Get agency statistics
- `GET /api/agencies/:id/reviews` - Get agency reviews

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)
- `GET /api/categories/:id/packages` - Get packages by category

### Packages
- `GET /api/packages` - Get all packages with filters
- `GET /api/packages/featured` - Get featured packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create new package (Agency)
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package
- `PUT /api/packages/:id/status` - Update package status
- `PUT /api/packages/:id/featured` - Toggle featured status (Admin)
- `GET /api/packages/:id/availability` - Get package availability
- `POST /api/packages/:id/availability` - Add package availability
- `GET /api/packages/:id/reviews` - Get package reviews

### Bookings
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/payment` - Process payment
- `GET /api/bookings/:id/travelers` - Get booking travelers
- `POST /api/bookings/:id/travelers` - Add traveler to booking

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PUT /api/reviews/:id/verify` - Verify review (Admin)
- `GET /api/reviews/stats/overview` - Get review statistics
- `GET /api/reviews/my` - Get user's reviews

### Chat (AI)
- `GET /api/chat/sessions` - Get user's chat sessions
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions/:id` - Get chat session by ID
- `PUT /api/chat/sessions/:id` - Update chat session
- `DELETE /api/chat/sessions/:id` - Delete chat session
- `GET /api/chat/sessions/:id/messages` - Get chat messages
- `POST /api/chat/sessions/:id/messages` - Send message
- `DELETE /api/chat/messages/:id` - Delete message

### AI Itinerary
- `GET /api/ai-itinerary` - Get user's itineraries
- `GET /api/ai-itinerary/:id` - Get itinerary by ID
- `POST /api/ai-itinerary` - Generate AI itinerary
- `PUT /api/ai-itinerary/:id` - Update itinerary
- `DELETE /api/ai-itinerary/:id` - Delete itinerary
- `POST /api/ai-itinerary/:id/regenerate` - Regenerate itinerary
- `POST /api/ai-itinerary/:id/share` - Share itinerary

### Inquiries
- `GET /api/inquiries` - Get all inquiries (Admin)
- `GET /api/inquiries/my` - Get user's inquiries
- `GET /api/inquiries/agency` - Get agency inquiries
- `GET /api/inquiries/:id` - Get inquiry by ID
- `POST /api/inquiries` - Create new inquiry
- `PUT /api/inquiries/:id/status` - Update inquiry status
- `GET /api/inquiries/:id/messages` - Get inquiry messages
- `POST /api/inquiries/:id/messages` - Send inquiry message
- `PUT /api/inquiries/messages/:id/read` - Mark message as read

### VR Experiences
- `GET /api/vr/experiences` - Get all VR experiences
- `GET /api/vr/experiences/featured` - Get featured VR experiences
- `GET /api/vr/experiences/:id` - Get VR experience by ID
- `POST /api/vr/experiences` - Create VR experience (Admin)
- `PUT /api/vr/experiences/:id` - Update VR experience (Admin)
- `DELETE /api/vr/experiences/:id` - Delete VR experience (Admin)
- `PUT /api/vr/experiences/:id/status` - Update VR experience status (Admin)
- `PUT /api/vr/experiences/:id/featured` - Toggle featured status (Admin)
- `GET /api/vr/bookings` - Get all VR bookings (Admin)
- `GET /api/vr/bookings/my` - Get user's VR bookings
- `GET /api/vr/bookings/:id` - Get VR booking by ID
- `POST /api/vr/bookings` - Create VR booking
- `PUT /api/vr/bookings/:id/status` - Update VR booking status
- `GET /api/vr/stats` - Get VR statistics

### Analytics
- `GET /api/analytics/overview` - Get platform overview (Admin)
- `GET /api/analytics/revenue` - Get revenue analytics (Admin)
- `GET /api/analytics/packages` - Get package analytics
- `GET /api/analytics/users` - Get user analytics (Admin)
- `GET /api/analytics/agencies` - Get agency analytics (Admin)
- `POST /api/analytics/events` - Track analytics event

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **Customer**: Can book packages, write reviews, use AI features
- **Agency**: Can manage packages, view bookings, respond to inquiries
- **Admin**: Full access to all features and analytics

## Error Handling

All API responses follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": object (optional),
  "details": array (optional, for validation errors)
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## Security Features

- Helmet for security headers
- CORS protection
- Input validation with Joi
- SQL injection protection via Supabase
- Rate limiting
- JWT token validation

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `CORS_ORIGIN` | CORS allowed origin | No (default: http://localhost:3000) |

## Database Schema

The backend works with the Supabase database schema that includes:

- **users** - User authentication (Supabase Auth)
- **profiles** - User profiles and roles
- **agencies** - Travel agency information
- **categories** - Package categories
- **packages** - Travel packages
- **package_availability** - Package availability dates
- **bookings** - Customer bookings
- **booking_travelers** - Traveler information
- **payments** - Payment records
- **reviews** - Customer reviews
- **chat_sessions** - AI chat sessions
- **chat_messages** - AI chat messages
- **ai_itineraries** - AI-generated itineraries
- **inquiries** - Customer inquiries
- **inquiry_messages** - Inquiry messages
- **analytics_events** - Analytics tracking
- **commission_transactions** - Commission tracking
- **vr_experiences** - VR experiences
- **vr_bookings** - VR bookings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

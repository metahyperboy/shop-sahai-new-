# Shop Sahai - Product Requirements Document

## Product Overview
Shop Sahai is a comprehensive financial management application designed for small business owners and individuals to track their financial transactions, manage purchases, handle borrowing/lending, and maintain expense records through both traditional input methods and voice commands.

## Target Users
- Small business owners
- Shop keepers
- Individual entrepreneurs
- People who need to track personal finances
- Users who prefer voice-based data entry

## Core Features

### 1. Authentication System
- Email/password based authentication
- Secure user sessions
- User profile management
- Logout functionality

### 2. Financial Dashboard
- **Income Overview**: Display total income with green indicators
- **Expense Overview**: Display total expenses with red indicators  
- **Gain Calculation**: Automatic profit/loss calculation (Income - Expenses)
- **Recent Transactions**: Quick view of latest financial activities
- **Visual Indicators**: Color-coded transaction types and amounts

### 3. Purchase Management
- **Supplier Tracking**: Record purchases from different suppliers
- **Amount Management**: Track total amount, amount paid, and outstanding balance
- **Payment History**: Update payment status and track partial payments
- **CRUD Operations**: Create, read, update, delete purchase records

### 4. Borrow Management  
- **Borrower Tracking**: Record money lent to individuals
- **Outstanding Amounts**: Track total given, amount returned, and balance
- **Repayment Tracking**: Update repayment status and partial returns
- **CRUD Operations**: Full management of borrowing records

### 5. Income & Expense Tracking
- **Transaction Recording**: Log income and expense transactions
- **Category Management**: Organize transactions by categories
- **Amount Tracking**: Record transaction amounts with descriptions
- **Transaction History**: View and manage all financial transactions

### 6. Voice Assistant
- **Voice Commands**: Natural language processing for data entry
- **Multi-language Support**: English and Malayalam voice recognition
- **Command Processing**: Parse voice commands to extract:
  - Transaction amounts
  - Categories/descriptions
  - Supplier/borrower names
  - Transaction types (income/expense/purchase/borrow)
- **Audio Feedback**: Text-to-speech responses in user's preferred language
- **Real-time Processing**: Immediate voice command processing and database updates

### 7. Multi-language Support
- **English Interface**: Complete English language support
- **Malayalam Interface**: Full Malayalam language support including:
  - UI translations
  - Voice commands
  - Audio feedback
  - Number formatting

### 8. User Settings & Preferences
- **Dark/Light Mode**: Toggle between theme modes
- **Language Selection**: Switch between English and Malayalam
- **User Profile**: Manage user name and preferences
- **Settings Persistence**: Save user preferences across sessions

### 9. Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large buttons and easy navigation
- **Bottom Navigation**: Fixed bottom navigation for easy access
- **Floating Action Button**: Quick access to voice assistant

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **State Management**: React hooks and local state
- **Routing**: React Router for navigation

### Backend & Database
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **Real-time**: Real-time database updates
- **Row Level Security**: User-specific data access
- **Tables**:
  - `purchases`: Supplier purchase tracking
  - `borrows`: Money lending tracking  
  - `transactions`: Income/expense records

### Voice Processing
- **Speech Recognition**: Web Speech API (SpeechRecognition)
- **Text-to-Speech**: Web Speech API (SpeechSynthesis)
- **Language Support**: English (en-US) and Malayalam (ml-IN)
- **Command Processing**: Custom natural language parsing

## User Interface Design

### Navigation Structure
- **Bottom Navigation**: Home, Purchase, Borrow, Expense tabs
- **Top Header**: App branding, user greeting, settings, logout
- **Floating Voice Button**: Always accessible voice assistant trigger

### Design System
- **Color Scheme**: Semantic color tokens with HSL values
- **Typography**: Responsive text sizing
- **Spacing**: Consistent spacing system
- **Components**: Reusable UI components with variants

### Mobile Optimization
- **Touch Targets**: Minimum 44px touch targets
- **Scrollable Areas**: Proper scroll handling for content
- **Fixed Elements**: Header and navigation stay fixed
- **Voice Integration**: Easy voice command access

## Data Models

### Purchases Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- supplier_name: TEXT
- total_amount: DECIMAL(10,2)
- amount_paid: DECIMAL(10,2)
- balance: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Borrows Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- borrower_name: TEXT
- total_given: DECIMAL(10,2)
- amount_paid: DECIMAL(10,2)
- balance: DECIMAL(10,2)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Transactions Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- type: TEXT ('income' | 'expense')
- amount: DECIMAL(10,2)
- category: TEXT
- description: TEXT (Optional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Security & Privacy
- **Row Level Security**: Each user can only access their own data
- **Authentication Required**: All features require user authentication
- **Data Encryption**: Database encryption at rest
- **Session Management**: Secure session handling with auto-refresh

## Performance Requirements
- **Page Load Time**: < 2 seconds for initial load
- **Voice Response Time**: < 1 second for voice command processing
- **Database Queries**: Optimized queries with proper indexing
- **Offline Capability**: Basic offline functionality for viewing data

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Android Chrome
- **Voice Features**: Browsers supporting Web Speech API
- **Responsive Design**: Works on all screen sizes

## Future Enhancements
- **Export/Import**: Data export to CSV/Excel
- **Reporting**: Financial reports and analytics
- **Backup/Restore**: Data backup and restore functionality
- **Multi-currency**: Support for different currencies
- **Notifications**: Payment reminders and alerts
- **Advanced Voice Commands**: More complex voice interactions

## Success Metrics
- **User Engagement**: Daily active users and session duration
- **Voice Usage**: Percentage of transactions entered via voice
- **Data Accuracy**: Error rates in voice command processing
- **User Satisfaction**: App store ratings and user feedback
- **Performance**: Page load times and response times
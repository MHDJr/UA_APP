# Usthad Academy - CEO Command Center

A professional, full-stack command center with dual-role access for CEOs and Staff members.

## Features

### CEO Command View
- **Live Presence Tracking**: Real-time "Who's In" grid showing staff status
- **KPI Scorecards**: Visual cards for Daily Sales, Support Tickets, and Project Progress
- **Broadcast System**: Send instant alerts to all staff members
- **Smart Contact Cards**: Staff directory with Jitsi Meet video call integration
- **Approval Queue**: One-tap approval/rejection for leave requests and expenses
- **Virtual Knocks**: See when staff members need your attention
- **CCTV Monitor**: Placeholder for secure RTSP stream integration
- **Activity Feed**: Real-time office activities and updates

### Staff Utility Portal
- **Attendance Tracking**: One-click clock in/out system
- **Personalized Task List**: View and manage tasks with priority tags
- **Request Forms**: Submit leave requests, expenses, feedback, or budget needs
- **CEO Status Tracker**: Real-time door status (Open/Do Not Disturb)
- **Virtual Knock**: Request CEO attention when available
- **Real-time Broadcasts**: Receive instant alerts from CEO

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 2. Database Setup

The database schema has already been created with the following tables:
- `profiles` - User profiles with role-based access
- `tasks` - Task assignments
- `requests` - Leave/expense/feedback requests
- `broadcasts` - CEO broadcast messages
- `knocks` - Virtual knock notifications
- `activity_feed` - Activity tracking
- `attendance` - Clock in/out records

All tables have Row Level Security (RLS) enabled with appropriate policies.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Account

1. Click on the "Sign Up" tab
2. Enter your details
3. Select your role (CEO or Staff)
4. Click "Create Account"

## Usage Guide

### For CEOs

1. **Dashboard Overview**: Upon login, you'll see real-time KPIs and staff presence
2. **Send Broadcasts**: Use the megaphone section to send instant alerts
3. **Manage Approvals**: Review and approve/reject requests in the Approval Queue
4. **Contact Staff**: Click on any staff card to view contact details and start a video call
5. **Monitor Activity**: Check the Activity Feed for recent office events
6. **Set Door Status**: Toggle between "Open Door" and "Do Not Disturb"

### For Staff

1. **Clock In/Out**: Use the large attendance button on your dashboard
2. **View Tasks**: Check your assigned tasks with priority indicators
3. **Submit Requests**: Use the request form for leave, expenses, or feedback
4. **Virtual Knock**: Request CEO attention when their door is open
5. **Update Status**: Set your status (Online, Busy, Away, Offline)
6. **Complete Tasks**: Mark tasks as in-progress or completed

## Technical Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth
- **Notifications**: Sonner (toast notifications)

## Key Features

- Role-Based Access Control (RBAC)
- Real-time updates across all features
- Responsive design for mobile access
- Dark mode optimized
- Professional executive dashboard design
- Secure data management with RLS

## Security

- All database tables protected by Row Level Security
- CEO-only operations restricted at the database level
- Staff can only view/modify their own data
- Real-time subscriptions filtered by user permissions

## Support

For issues or questions, please contact the development team.

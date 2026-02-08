# DevTalk - Developer Community Forum

A modern, full-stack forum application built for developers to share knowledge, discuss topics, and connect.

## 🚀 Features

- **Authentication**: Secure Sign Up and Login using Supabase Auth.
- **Create Posts**: Rich text posting with Markdown support.
- **Discussion Feed**: Filterable feed of latest discussions and topics.
- **Categories**: Organize posts by topics (React, JavaScript, Career, etc.).
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.
- **Real-time Updates**: (Planned) Real-time notifications and feed updates.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Backend / Database**: Supabase (PostgreSQL)
- **Utilities**:
  - `date-fns` for date formatting
  - `sonner` for toast notifications
  - `react-markdown` for rendering post content

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd forum
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### 🗄️ Database Setup (Critical)

This project uses Supabase as the backend. You need to set up the database schema before running the app.

1.  Go to your **Supabase Dashboard**.
2.  Open the **SQL Editor**.
3.  Copy the contents of `supabase_schema.sql` from this project's root directory.
4.  Paste and **Run** the SQL command.
    - This creates the `profiles`, `posts`, `comments`, and `votes` tables.
    - It also sets up Row Level Security (RLS) policies and triggers.

> **Important**: If you created a user account _before_ running this migration, that user won't have a profile. You should sign out and create a new account to ensure all triggers fire correctly.

### Running the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (Layout, Skeleton, etc.)
├── features/       # Feature-based modules
│   ├── auth/       # Authentication (Login, SignUp, AuthProvider)
│   ├── dashboard/  # Main dashboard view
│   └── posts/      # Post related features (Feed, Create, Details)
├── lib/            # Utilities (Supabase client)
└── assets/         # Static assets
```

## 📝 License

This project is licensed under the MIT License.

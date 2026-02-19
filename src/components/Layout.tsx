import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { supabase } from "@/lib/supabase";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              DevTalk
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <UserIcon size={18} />
              </div>
              <span className="hidden md:inline font-medium">
                {user?.user_metadata?.username || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

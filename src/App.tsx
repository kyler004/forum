import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import LoginPage from "@/features/auth/LoginPage";
import SignUpPage from "@/features/auth/SignUpPage";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <div className="min-h-screen bg-gray-50 text-gray-900">
                  <header className="bg-white shadow-sm p-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                      <h1 className="text-2xl font-bold text-indigo-600">
                        DevTalk
                      </h1>
                      {/* Logout button could be added here later */}
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto p-4">
                    <p className="mt-4 text-gray-600">
                      Welcome to your dashboard!
                    </p>
                  </main>
                </div>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

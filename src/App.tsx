import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import LoginPage from "@/features/auth/LoginPage";
import SignUpPage from "@/features/auth/SignUpPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/features/dashboard/Dashboard";
import PostDetailsPage from "@/features/posts/PostDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/post/:id"
                element={
                  <Layout>
                    <PostDetailsPage />
                  </Layout>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

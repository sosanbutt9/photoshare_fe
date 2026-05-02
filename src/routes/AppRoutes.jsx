import { Routes, Route, Outlet } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
import { RoleRoute } from './RoleRoute'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { Explore } from '../pages/Explore'
import { PhotoView } from '../pages/PhotoView'
import { CreatorDashboard } from '../pages/creator/CreatorDashboard'
import { UploadPhoto } from '../pages/creator/UploadPhoto'
import { MyPhotos } from '../pages/creator/MyPhotos'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { Profile } from '../pages/Profile'
import { NotFound } from '../pages/NotFound'

function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route path="/explore" element={<Explore />} />
        <Route path="/photos/:id" element={<PhotoView />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['creator', 'admin']}>
                <CreatorDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/upload"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['creator', 'admin']}>
                <UploadPhoto />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/photos"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['creator', 'admin']}>
                <MyPhotos />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

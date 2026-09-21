import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  Box,
  CircularProgress,
} from '@mui/material'

import LoginPage from './pages/LoginPage'

import SDOLayout from './layouts/SDOLayout'
import DepartmentLayout from './layouts/DepartmentLayout'

import DailyReport from './pages/sdo/DailyReport'

import Dashboard from './pages/department/Dashboard'
import DailyReports from './pages/department/DailyReports'
import NonFunctional from './pages/department/NonFunctional'
import MasterData from './pages/department/MasterData'

import { useAuth } from './auth/AuthContext'


function FullPageLoader() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  )
}


function RequireRole({
  roles,
  children,
}) {
  const auth =
    useAuth()

  const user =
    auth?.user

  const token =
    auth?.token

  const loading =
    Boolean(
      auth?.loading
    )

  if (loading) {
    return <FullPageLoader />
  }

  if (
    !token ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const currentRole =
    String(
      user.role || ''
    )
      .trim()
      .toUpperCase()

  const allowed =
    roles
      .map(
        (role) =>
          String(
            role
          )
            .trim()
            .toUpperCase()
      )
      .includes(
        currentRole
      )

  if (!allowed) {
    if (
      currentRole ===
      'SDO'
    ) {
      return (
        <Navigate
          to="/sdo/report"
          replace
        />
      )
    }

    if (
      currentRole ===
        'DEPARTMENT' ||
      currentRole ===
        'ADMIN'
    ) {
      return (
        <Navigate
          to="/department/dashboard"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}


function HomeRedirect() {
  const auth =
    useAuth()

  const user =
    auth?.user

  const token =
    auth?.token

  const loading =
    Boolean(
      auth?.loading
    )

  if (loading) {
    return <FullPageLoader />
  }

  if (
    !token ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const role =
    String(
      user.role || ''
    )
      .trim()
      .toUpperCase()

  if (
    role === 'SDO'
  ) {
    return (
      <Navigate
        to="/sdo/report"
        replace
      />
    )
  }

  if (
    role ===
      'DEPARTMENT' ||
    role ===
      'ADMIN'
  ) {
    return (
      <Navigate
        to="/department/dashboard"
        replace
      />
    )
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  )
}


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeRedirect />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        path="/sdo"
        element={
          <RequireRole
            roles={[
              'SDO',
            ]}
          >
            <SDOLayout />
          </RequireRole>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="report"
              replace
            />
          }
        />

        <Route
          path="report"
          element={
            <DailyReport />
          }
        />
      </Route>

      <Route
        path="/department"
        element={
          <RequireRole
            roles={[
              'DEPARTMENT',
              'ADMIN',
            ]}
          >
            <DepartmentLayout />
          </RequireRole>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <Dashboard />
          }
        />

        <Route
          path="daily-reports"
          element={
            <DailyReports />
          }
        />

        <Route
          path="non-functional"
          element={
            <NonFunctional />
          }
        />

        <Route
          path="master-data"
          element={
            <MasterData />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <HomeRedirect />
        }
      />
    </Routes>
  )
}

export default App
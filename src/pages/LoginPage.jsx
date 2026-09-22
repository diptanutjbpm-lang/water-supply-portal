import { useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
//import { isDemoMode } from '../api/api'

const accessCards = [
  {
    title: 'SDO Access',
    subtitle: 'Daily field reporting',
    description: 'Submit scheme-wise operational and water supply status.',
    icon: <EngineeringRoundedIcon fontSize="small" />,
  },
  {
    title: 'Department Admin',
    subtitle: 'Monitoring & analytics',
    description: 'Review daily reports, analytics, exports and outage workflow.',
    icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
  },
]

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRoleLandingPath = (role) => {
    const normalizedRole = String(role || '').trim().toUpperCase()

    if (normalizedRole === 'DEPARTMENT' || normalizedRole === 'ADMIN') {
      return '/department'
    }

    return '/sdo/report'
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={getRoleLandingPath(user?.role)}
        replace
      />
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!/^\d{10}$/.test(mobile.trim())) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    if (!password) {
      setError('Enter your password.')
      return
    }

    try {
      setLoading(true)

      const loggedInUser = await login(
        mobile.trim(),
        password,
      )

      navigate(
        getRoleLandingPath(loggedInUser.role),
        { replace: true },
      )
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F4F7FA',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(360px, 42%) minmax(0, 58%)',
        },
      }}
    >
      {/* =====================================================
          LEFT BRAND / ACCESS PANEL
          Desktop only. Mobile gets a compact header below.
         ===================================================== */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          px: { md: 5, lg: 7 },
          py: { md: 5, lg: 6 },
          color: '#FFFFFF',
          background:
            'linear-gradient(145deg, #082A4B 0%, #0B3E69 52%, #0C5F86 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            top: -150,
            right: -120,
            border: '1px solid rgba(255,255,255,0.10)',
            bgcolor: 'rgba(255,255,255,0.025)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 250,
            height: 250,
            borderRadius: '50%',
            bottom: -90,
            left: -80,
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.02)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.6}
          >
            <Avatar
              src="/logo.png"
              sx={{
                width: 54,
                height: 54,
                border: '2px solid rgba(255,255,255,0.75)',
                boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
                '& img': {
                  objectFit: 'contain',
                  bgcolor: '#fff',
                  p: 0.35,
                }
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  opacity: 0.82,
                  lineHeight: 1.2,
                }}
              >
                Tripura Jal Board
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 19,
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                Drinking Water & Sanitation Department
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: { md: 8, lg: 10 },
              maxWidth: 520,
            }}
          >
            <Chip
              icon={
                <VerifiedUserRoundedIcon
                  sx={{ color: '#BDE7FF !important' }}
                />
              }
              label="Department Staff Portal"
              size="small"
              sx={{
                px: 0.5,
                bgcolor: 'rgba(255,255,255,0.10)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.14)',
                fontWeight: 700,
              }}
            />

            <Typography
              sx={{
                mt: 2.5,
                fontSize: {
                  md: 34,
                  lg: 42,
                },
                fontWeight: 850,
                letterSpacing: -0.8,
                lineHeight: 1.08,
              }}
            >
              Water Supply
              <Box component="span" sx={{ display: 'block', color: '#BDE7FF' }}>
                Monitoring Portal
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2,
                maxWidth: 470,
                color: 'rgba(255,255,255,0.76)',
                fontSize: 15,
                lineHeight: 1.75,
              }}
            >
              A unified internal workspace for daily operational reporting,
              water supply monitoring and departmental oversight.
            </Typography>
          </Box>

          <Stack
            spacing={1.25}
            sx={{
              mt: 4,
              maxWidth: 520,
            }}
          >
            {accessCards.map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                sx={{
                  p: 1.7,
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 2,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      color: '#D7F1FF',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Typography fontWeight={800} fontSize={14}>
                        {item.title}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{ color: '#BDE7FF', fontWeight: 700 }}
                      >
                        {item.subtitle}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.35,
                        color: 'rgba(255,255,255,0.68)',
                        fontSize: 12.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Box sx={{ mt: 'auto', pt: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#9DE2BF' }} />
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.66)',
                }}
              >
                Access is assigned automatically from your departmental login.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* =====================================================
          RIGHT LOGIN AREA
         ===================================================== */}
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F6F9FC',
          backgroundImage:
            'radial-gradient(circle at 90% 8%, rgba(23,104,172,0.08), transparent 28%), radial-gradient(circle at 8% 92%, rgba(16,52,95,0.06), transparent 30%)',
        }}
      >
        {/* Mobile brand header */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            px: 2.5,
            pt: 3,
          }}
        >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Avatar
              src="/logo.png"
              sx={{
                width: 46,
                height: 46,
                border: '2px solid rgba(255,255,255,0.75)',
                boxShadow: '0 8px 20px rgba(16,52,95,0.22)',
                '& img': {
                  objectFit: 'contain',
                  bgcolor: '#fff',
                  p: 0.35,
                }
              }}
            />

            <Box minWidth={0}>
              <Typography fontSize={11.5} color="text.secondary">
                Tripura Jal Board
              </Typography>
              <Typography
                fontWeight={850}
                color="primary.main"
                sx={{ lineHeight: 1.2 }}
              >
                Water Supply Monitoring Portal
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'grid',
            placeItems: 'center',
            px: { xs: 2, sm: 3.5, md: 5 },
            py: { xs: 3, md: 5 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 455,
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  color: '#0B5FA5',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1.1,
                }}
              >
                Staff Sign In
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: '#102A43',
                  fontSize: { xs: 28, sm: 32 },
                  fontWeight: 850,
                  letterSpacing: -0.5,
                  lineHeight: 1.15,
                }}
              >
                Welcome back
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Sign in using the mobile number and password issued by the
                department. Your SDO or Admin workspace will open automatically.
              </Typography>
            </Box>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid #E0E8F0',
                boxShadow: '0 10px 32px rgba(16,52,95,0.08)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  pt: 2.5,
                  pb: 1.5,
                  background:
                    'linear-gradient(180deg, rgba(238,245,251,0.75), rgba(255,255,255,0))',
                }}
              >
                <Stack direction="row" spacing={1.3} alignItems="center">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      bgcolor: '#EEF5FB',
                      color: '#0B5FA5',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <WaterDropRoundedIcon />
                  </Box>

                  <Box>
                    <Typography fontWeight={850} color="#102A43">
                      Department Login
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SDO and Department Administrator
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <CardContent
                sx={{
                  p: { xs: 2.4, sm: 3 },
                  '&:last-child': {
                    pb: { xs: 2.4, sm: 3 },
                  },
                }}
              >
                {error && (
                  <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{
                      mb: 2.25,
                      borderRadius: 2,
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* {isDemoMode && (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2.25,
                      borderRadius: 2,
                    }}
                  >
                    Preview mode: use <b>9000000002</b> / <b>TJB@123</b>.
                  </Alert>
                )} */}

                <Box component="form" onSubmit={handleSubmit}>
                  <Typography
                    sx={{
                      mb: 0.75,
                      fontSize: 12.5,
                      color: '#34495E',
                      fontWeight: 750,
                    }}
                  >
                    Mobile Number
                  </Typography>

                  <TextField
                    fullWidth
                    autoComplete="username"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10),
                      )
                    }
                    inputProps={{
                      inputMode: 'numeric',
                      maxLength: 10,
                      'aria-label': 'Mobile Number',
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneAndroidRoundedIcon
                            sx={{ fontSize: 20, color: '#6B7C8F' }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        minHeight: 48,
                        bgcolor: '#FBFCFE',
                        borderRadius: 1.5,
                      },
                    }}
                  />

                  <Typography
                    sx={{
                      mb: 0.75,
                      fontSize: 12.5,
                      color: '#34495E',
                      fontWeight: 750,
                    }}
                  >
                    Password
                  </Typography>

                  <TextField
                    fullWidth
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    inputProps={{
                      'aria-label': 'Password',
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon
                            sx={{ fontSize: 20, color: '#6B7C8F' }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((prev) => !prev)}
                            onMouseDown={(e) => e.preventDefault()}
                            sx={{ color: '#6B7C8F', mr: -0.5 }}
                          >
                            {showPassword ? (
                              <VisibilityOffRoundedIcon fontSize="small" />
                            ) : (
                              <VisibilityRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        minHeight: 48,
                        bgcolor: '#FBFCFE',
                        borderRadius: 1.5,
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <LoginRoundedIcon />
                      )
                    }
                    sx={{
                      minHeight: 48,
                      borderRadius: 1.5,
                      bgcolor: '#103F70',
                      boxShadow: '0 8px 20px rgba(16,63,112,0.22)',
                      '&:hover': {
                        bgcolor: '#0B355F',
                        boxShadow: '0 10px 24px rgba(16,63,112,0.28)',
                      },
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In to Portal'}
                  </Button>
                </Box>

                <Box
                  sx={{
                    mt: 2.25,
                    pt: 2,
                    borderTop: '1px solid #EDF2F7',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <VerifiedUserRoundedIcon
                      sx={{ mt: 0.15, fontSize: 17, color: '#17844D' }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        lineHeight: 1.55,
                        color: 'text.secondary',
                      }}
                    >
                      No registration is available. Login credentials and role
                      access are managed by the department.
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Combined Footer & Meta Information */}
            <Box sx={{ textAlign: 'center', mt: 4, pb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 0.3 }}>
                Internal departmental portal &bull; Water Supply Monitoring System
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 700, color: '#6B7C8F' }}>
                Tripura Jal Board
              </Typography>
              <Typography variant="caption" sx={{ color: '#8898AA' }}>
                Government of Tripura
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

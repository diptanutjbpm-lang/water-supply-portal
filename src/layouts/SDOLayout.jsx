import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const TJB_LOGO_URL = '/logo.png'

function formatToday() {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
}

export default function SDOLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        width: '100%',
        overflowX: 'hidden',
        bgcolor: '#eef4f8',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(23,104,172,0.08), transparent 28%), linear-gradient(180deg, #f7fafc 0%, #eef4f8 28%, #eef4f8 100%)',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(115deg, #0b2f57 0%, #103f73 55%, #16558e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 58, sm: 68, md: 72 },
            px: { xs: 1.25, sm: 2.5, md: 3 },
            gap: 1.5,
            width: '100%',
          }}
        >
          <Avatar
            src={TJB_LOGO_URL}
            alt="Tripura Jal Board"
            sx={{
              width: { xs: 40, sm: 46, md: 48 },
              height: { xs: 40, sm: 46, md: 48 },
              bgcolor: '#ffffff',
              color: '#10345f',
              fontSize: 12,
              fontWeight: 900,
              border: '2px solid rgba(255,255,255,0.75)',
              boxShadow: '0 8px 22px rgba(0,0,0,0.18)',
              '& img': {
                objectFit: 'contain',
                p: 0.35,
                bgcolor: '#fff',
              },
            }}
          >
            TJB
          </Avatar>

          <Box minWidth={0}>
            <Typography
              noWrap
              sx={{
                fontSize: { xs: 13.5, sm: 15, md: 16 },
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}
            >
              Tripura Jal Board
            </Typography>
            <Typography
              sx={{
                mt: 0.35,
                fontSize: { xs: 10, sm: 11, md: 11.5 },
                opacity: 0.82,
                lineHeight: 1.15,
              }}
            >
              Daily Outage Report
            </Typography>
          </Box>

          <Button
            color="inherit"
            variant="text"
            size="small"
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout}
            sx={{
              ml: 'auto',
              px: { xs: 1, sm: 1.6 },
              py: 0.8,
              borderRadius: 2,
              fontWeight: 800,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.10)' },
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.7 } },
              minWidth: { xs: 40, sm: 'auto' },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Logout
            </Box>
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1.25, sm: 2, md: 2.5 },
          py: { xs: 1.5, sm: 2.25, md: 3 },
          width: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            mb: { xs: 1.5, sm: 2.25 },
            p: { xs: 1.5, sm: 2, md: 2.25 },
            border: '1px solid #dce6ef',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ffffff 0%, #f7fbff 100%)',
            boxShadow: '0 4px 18px rgba(16,52,95,0.05)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.25, sm: 1.5 }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box minWidth={0}>
              <Typography
                sx={{
                  color: '#12365e',
                  fontSize: { xs: 18, sm: 20, md: 22 },
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Good day, {user?.name || 'SDO'}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.8}
              flexWrap="wrap"
              useFlexGap
              sx={{ flexShrink: 0, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}
            >
              <Chip
                size="small"
                icon={<PlaceRoundedIcon />}
                label={user?.subDivision || 'Assigned Sub-Division'}
                sx={{ bgcolor: '#f4f6f8', color: '#526273', fontWeight: 700 }}
              />
              <Chip
                size="small"
                icon={<CalendarMonthRoundedIcon />}
                label={formatToday()}
                sx={{ bgcolor: '#f4f6f8', color: '#526273', fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </Paper>

        <Outlet />

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Tripura Jal Board
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Government of Tripura
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

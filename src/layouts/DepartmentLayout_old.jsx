import { useState } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import StorageRoundedIcon from '@mui/icons-material/StorageRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'

import { useAuth } from '../auth/AuthContext'

const DRAWER_WIDTH = 280

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/department/dashboard',
    icon: <DashboardRoundedIcon />,
  },
  {
    label: 'View Daily Outage Report',
    path: '/department/daily-reports',
    icon: <AssessmentRoundedIcon />,
  },
  {
    label: 'Non-Functional Schemes',
    path: '/department/non-functional',
    icon: <ReportProblemRoundedIcon />,
  },
  {
    label: 'Master Data',
    path: '/department/master-data',
    icon: <StorageRoundedIcon />,
  },
]

function DepartmentLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const location = useLocation()
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)

    if (!isDesktop) {
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', {
        replace: true,
      })
    }
  }

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0B3558',
        color: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: '#FFFFFF',
              color: '#0B3558',
              fontWeight: 800,
            }}
          >
            GT
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                opacity: 0.82,
                lineHeight: 1.2,
              }}
            >
              Government of Tripura
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                lineHeight: 1.3,
                mt: 0.25,
              }}
            >
              Water Supply Monitoring
            </Typography>
          </Box>
        </Stack>

        <Chip
          label="Department Portal"
          size="small"
          sx={{
            mt: 2,
            bgcolor: 'rgba(255,255,255,0.12)',
            color: '#FFFFFF',
            fontWeight: 600,
          }}
        />
      </Box>

      <Divider
        sx={{
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      />

      <Box
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: 'block',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 700,
            letterSpacing: 0.8,
          }}
        >
          ADMINISTRATION
        </Typography>

        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const selected =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`)

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mb: 0.75,
                  borderRadius: 2,
                  color: selected
                    ? '#0B3558'
                    : 'rgba(255,255,255,0.86)',

                  bgcolor: selected
                    ? '#FFFFFF'
                    : 'transparent',

                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#0B3558',
                  },

                  '&.Mui-selected:hover': {
                    bgcolor: '#F4F8FB',
                  },

                  '&:hover': {
                    bgcolor: selected
                      ? '#F4F8FB'
                      : 'rgba(255,255,255,0.08)',
                  },

                  py: 1.25,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 42,
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: selected ? 700 : 500,
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      <Box>
        <Divider
          sx={{
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        />

        <Box
          sx={{
            p: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'rgba(255,255,255,0.15)',
              }}
            >
              <AccountCircleRoundedIcon />
            </Avatar>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                noWrap
                variant="body2"
                sx={{
                  fontWeight: 700,
                }}
              >
                {user?.name ||
                  user?.fullName ||
                  'Department Admin'}
              </Typography>

              <Typography
                noWrap
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                {user?.designation ||
                  user?.role ||
                  'Department'}
              </Typography>
            </Box>

            <Tooltip title="Logout">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#FFFFFF',
                }}
              >
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F4F7FA',
      }}
    >
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          bgcolor: '#FFFFFF',
          color: '#102A43',
          borderBottom: '1px solid #E7EDF3',

          width: {
            xs: '100%',
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },

          ml: {
            xs: 0,
            md: `${DRAWER_WIDTH}px`,
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: '68px !important',
          }}
        >
          {!isDesktop && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{
                mr: 1,
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}

          <WaterDropRoundedIcon
            sx={{
              color: '#1976D2',
              mr: 1.25,
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: 15,
                  sm: 17,
                },
                fontWeight: 700,
              }}
            >
              Water Supply Monitoring Portal
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Drinking Water & Sanitation Department
            </Typography>
          </Box>

          <Chip
            label="ADMIN"
            size="small"
            sx={{
              display: {
                xs: 'none',
                sm: 'inline-flex',
              },
              fontWeight: 700,
            }}
          />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: DRAWER_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop || mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            md: `${DRAWER_WIDTH}px`,
          },

          pt: '68px',

          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
              lg: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default DepartmentLayout
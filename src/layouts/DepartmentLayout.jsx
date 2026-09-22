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
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'

import { useAuth } from '../auth/AuthContext'

const DRAWER_WIDTH = 280

/*
 * Only the modules currently required by the Department Portal
 * are shown in the sidebar.
 *
 * Non-Functional Schemes and Master Data routes are intentionally
 * kept in App.jsx, so they can be restored later without breaking
 * the current project. They are simply hidden from navigation.
 */
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
]

function DepartmentLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const location = useLocation()
  const navigate = useNavigate()

  const { logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)

    if (!isDesktop) {
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return

    try {
      setLogoutDialogOpen(false)
      setLoggingOut(true)
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src="/logo.png"
            sx={{
              width: 48,
              height: 48,
              bgcolor: '#FFFFFF',
              border: '2px solid rgba(255,255,255,0.75)',
              '& img': {
                objectFit: 'contain',
                bgcolor: '#fff',
                p: 0.35,
              }
            }}
          />

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
        </Box>

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

                  transition: 'all 0.2s ease-in-out',

                  '&:hover': {
                    bgcolor: selected
                      ? '#F4F8FB'
                      : 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
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

      {/*
       * Department Administrator profile block removed.
       * Logout now occupies the bottom sidebar area directly.
       */}
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
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => setLogoutDialogOpen(true)}
            disabled={loggingOut}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2,
              borderRadius: 2,
              borderColor: 'rgba(255,255,255,0.30)',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',

              '&:hover': {
                borderColor: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.08)',
                transform: 'translateY(-1px)',
              },

              '&.Mui-disabled': {
                color: 'rgba(255,255,255,0.55)',
                borderColor: 'rgba(255,255,255,0.15)',
              },
            }}
          >
            {loggingOut ? 'Signing out...' : 'Logout'}
          </Button>
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',

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
            icon={<AdminPanelSettingsRoundedIcon sx={{ color: '#0B3558 !important', fontSize: 16 }} />}
            label="ADMIN"
            size="small"
            sx={{
              display: {
                xs: 'none',
                sm: 'inline-flex',
              },
              fontWeight: 800,
              bgcolor: '#EEF5FB',
              color: '#0B3558',
              px: 0.5,
              border: '1px solid #D7E8F7'
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

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Tripura Jal Board
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Government of Tripura
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 320 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#12365e' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out of the portal?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: 1.5 }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained" disableElevation sx={{ fontWeight: 700, borderRadius: 1.5 }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DepartmentLayout

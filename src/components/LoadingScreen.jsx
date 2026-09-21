import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <Box minHeight="50vh" display="grid" sx={{ placeItems: 'center' }}>
      <Box textAlign="center">
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" mt={1.5}>{label}</Typography>
      </Box>
    </Box>
  )
}

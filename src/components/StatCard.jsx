import { Paper, Typography } from '@mui/material'

export default function StatCard({ value, label }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, textAlign: 'left', height: '100%' }}>
      <Typography fontSize={20} fontWeight={900} color="primary.main">{value}</Typography>
      <Typography fontSize={10.5} color="text.secondary" lineHeight={1.25}>{label}</Typography>
    </Paper>
  )
}

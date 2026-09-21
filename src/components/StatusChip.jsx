import { Chip } from '@mui/material'

export default function StatusChip({ value }) {
  const text = value || '—'
  const lower = text.toLowerCase()
  let color = 'default'
  if (/functional|working|available|done|yes|submitted/.test(lower) && !/non-|not /.test(lower)) color = 'success'
  if (/non-functional|failure|not working|not available|stopped|no$/.test(lower)) color = 'error'
  if (/pending|maintenance|low voltage|progress/.test(lower)) color = 'warning'
  return <Chip label={text} color={color} size="small" variant={color === 'default' ? 'outlined' : 'filled'} />
}

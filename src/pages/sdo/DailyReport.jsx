import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import FactoryRoundedIcon from '@mui/icons-material/FactoryRounded'
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { apiRequest } from '../../api/api'
import { useAuth } from '../../auth/AuthContext'
import LoadingScreen from '../../components/LoadingScreen'

const emptyForm = {
  functionalStatus: '',
  plantEndTime: '',
  waterProduction: '',
  pumpStatus: '',
  chlorinationStatus: '',
  powerStatus: '',
  issues: '',
  otherIssue: '',
  waterSupplyStatus: '',
  actionTaken: '',
}

const issueOptions = [
  'Motor Burnt', 'Pump Problem', 'Power Failure', 'Low Voltage / Power Failure',
  'Plant Problem', 'Mechanical Problem', 'Electrical Problem', 'Raw Water Shortage',
  'Pipeline Leakage', 'Low Discharge', 'Water Quality Issue', 'Chlorinator Malfunction',
  'Filter Media Choking', 'Other',
]

const actionOptions = [
  'No Action Required', 'Reported to Engineer', 'Reported to Department', 'Technician Informed',
  'Inspection Required', 'Repair Work Started', 'Repair Work Completed', 'Electrical Team Informed',
  'Power Department Informed', 'Temporary Arrangement Made', 'Issue Resolved', 'Under Observation', 'Other',
]

const cardSx = {
  border: '1px solid #dce6ef',
  borderRadius: 2,
  boxShadow: '0 3px 12px rgba(16,52,95,0.045)',
  overflow: 'hidden',
}

function SummaryCard({ value, label, caption, icon, tone = 'blue' }) {
  const tones = {
    blue: {
      bg: 'linear-gradient(145deg, #ffffff 0%, #f4f9fe 100%)',
      iconBg: '#e9f4fd',
      iconFg: '#1768ac',
      accent: '#4aa3df',
    },
    green: {
      bg: 'linear-gradient(145deg, #ffffff 0%, #f3fbf6 100%)',
      iconBg: '#e8f7ef',
      iconFg: '#17844d',
      accent: '#45b57a',
    },
    amber: {
      bg: 'linear-gradient(145deg, #ffffff 0%, #fff9ef 100%)',
      iconBg: '#fff3df',
      iconFg: '#b86b00',
      accent: '#e2a23e',
    },
  }
  const palette = tones[tone] || tones.blue

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 1.15, sm: 1.6 },
        minWidth: 0,
        minHeight: { xs: 82, sm: 96 },
        border: '1px solid #dce6ef',
        borderRadius: 2,
        background: palette.bg,
        boxShadow: '0 2px 10px rgba(16,52,95,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0 auto 0 0',
          width: 3,
          bgcolor: palette.accent,
          opacity: 0.9,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 22, md: 24 },
            lineHeight: 1,
            fontWeight: 900,
            color: '#12365e',
            letterSpacing: '-0.025em',
          }}
        >
          {value}
        </Typography>

        <Box
          sx={{
            width: { xs: 26, sm: 32 },
            height: { xs: 26, sm: 32 },
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: palette.iconBg,
            color: palette.iconFg,
            flexShrink: 0,
            '& svg': { fontSize: { xs: 15, sm: 18 } },
          }}
        >
          {icon}
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 0.6, sm: 0.8 }, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 10, sm: 11.5 },
            fontWeight: 800,
            color: '#263b50',
            lineHeight: 1.25,
            wordBreak: 'break-word',
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            display: { xs: 'none', sm: 'block' },
            mt: 0.35,
            fontSize: 9.5,
            color: 'text.secondary',
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {caption}
        </Typography>
      </Box>
    </Paper>
  )
}

function SectionHeading({ step, title }) {
  return (
    <Box
      sx={{
        width: '100%',
        mb: { xs: 1.4, sm: 1.8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          width: '100%',
          minWidth: 0,
        }}
      >
        {step && (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.3,
              borderRadius: 1,
              fontSize: { xs: 10, sm: 11 },
              fontWeight: 900,
              color: '#10345f',
              bgcolor: '#e9f2fb',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Step {step}
          </Box>
        )}

        <Typography
          sx={{
            fontSize: { xs: 14, sm: 15.5 },
            fontWeight: 800,
            color: '#12365e',
            lineHeight: 1.25,
            textAlign: 'left',
          }}
        >
          {title}
        </Typography>
      </Stack>
    </Box>
  )
}

function ReadOnlyItem({ label, value, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1, sm: 1.3 },
        bgcolor: '#f8fbfd',
        border: '1px solid #dde7ef',
        borderRadius: 1.5,
        minHeight: { xs: 66, sm: 74 },
        height: '100%',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ color: '#6e8296', display: 'grid', placeItems: 'center', '& svg': { fontSize: 14 } }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: { xs: 9, sm: 9.5 },
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: { xs: 11.5, sm: 12.5 },
          fontWeight: 800,
          color: '#263b50',
          mt: 0.5,
          wordBreak: 'break-word',
          lineHeight: 1.3,
        }}
      >
        {value || '—'}
      </Typography>
    </Paper>
  )
}

export default function DailyReport() {
  const { token, user } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [normalSelected, setNormalSelected] = useState(false)
  const plantEndTimeInputRef = useRef(null)

  const selectedScheme = useMemo(
    () => schemes.find((item) => String(item.id) === String(selectedId)),
    [schemes, selectedId],
  )

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const result = await apiRequest('getSchemes', { token })
        if (!result.success) throw new Error(result.message || 'Unable to load schemes.')
        if (!mounted) return
        setSchemes(result.schemes || [])
        if (result.schemes?.length) setSelectedId(String(result.schemes[0].id))
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load schemes.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const resetForm = () => {
    setForm(emptyForm)
    setNormalSelected(false)
    setError('')
  }

  const setNormal = () => {
    setNormalSelected(true)
    setForm((prev) => ({
      ...prev,
      functionalStatus: 'Functional',
      pumpStatus: 'Working',
      chlorinationStatus: 'Done',
      powerStatus: 'Available',
      issues: '',
      otherIssue: '',
      waterSupplyStatus: 'Yes',
      actionTaken: 'No Action Required',
    }))
  }

  const validate = () => {
    if (!selectedId) return 'Select a scheme / location.'
    if (!form.functionalStatus) return 'Select Functional / Non-Functional status.'
    if (!form.pumpStatus) return 'Select Pump Status.'
    if (!form.powerStatus) return 'Select Power Supply Status.'
    if (!form.waterSupplyStatus) return 'Select Today Water Supply status.'
    if (form.issues === 'Other' && !form.otherIssue.trim()) return 'Enter the issue detail.'
    return ''
  }

  const submit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setError('')
      setSubmitting(true)
      const result = await apiRequest('submitReport', {
        token,
        report: {
          schemeId: selectedScheme.id,
          functionalStatus: form.functionalStatus,
          plantEndTime: form.plantEndTime,
          waterProduction: form.waterProduction === '' ? null : Number(form.waterProduction),
          pumpStatus: form.pumpStatus,
          chlorinationStatus: form.chlorinationStatus,
          powerStatus: form.powerStatus,
          issues: form.issues === 'Other' ? form.otherIssue.trim() : form.issues,
          waterSupplyStatus: form.waterSupplyStatus,
          actionTaken: form.actionTaken,
        },
      })
      if (!result.success) throw new Error(result.message || 'Submission failed.')
      setSuccess(true)
      resetForm()
    } catch (err) {
      setError(err.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen label="Loading assigned water supply schemes..." />

  return (
    <Stack
      spacing={{ xs: 1.5, sm: 2 }}
      pb={{ xs: 3, sm: 5 }}
      sx={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: { xs: 0.7, sm: 1.25 },
          width: '100%',
          minWidth: 0,
        }}
      >
        <SummaryCard
          value={schemes.length}
          label="Assigned Schemes"
          caption="Schemes available for daily reporting"
          icon={<AssignmentTurnedInRoundedIcon />}
          tone="blue"
        />
        <SummaryCard
          value="—"
          label="Submitted Today"
          caption="Current-day submission count"
          icon={<CheckCircleRoundedIcon />}
          tone="green"
        />
        <SummaryCard
          value="—"
          label="Pending"
          caption="Reports still awaiting submission"
          icon={<ScheduleRoundedIcon />}
          tone="amber"
        />
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ borderRadius: 1.5, border: '1px solid #f1d0ce' }}
        >
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5 } } }}>
          <SectionHeading
            step="1"
            title="Select Scheme / Location"
          />

          <FormControl fullWidth>
            <InputLabel>Scheme / Location</InputLabel>
            <Select
              value={selectedId}
              label="Scheme / Location"
              IconComponent={KeyboardArrowDownRoundedIcon}
              onChange={(e) => { setSelectedId(e.target.value); resetForm() }}
              disabled={submitting}
              sx={{
                bgcolor: '#ffffff',
                minHeight: 48,
                borderRadius: 1.5,
                '& .MuiSelect-select': {
                  py: { xs: 1.2, sm: 1.35 },
                  px: { xs: 1.4, sm: 1.6 },
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cfd9e3' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#91abc2' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5 },
              }}
            >
              {schemes.map((scheme) => (
                <MenuItem key={scheme.id} value={String(scheme.id)}>
                  <Box sx={{ py: 0.25 }}>
                    <Typography fontSize={13} fontWeight={800} color="#263b50">
                      {scheme.scheme}
                    </Typography>
                    <Typography fontSize={10.5} color="text.secondary" mt={0.2}>
                      {scheme.systemType}
                      {scheme.ward ? ` · Ward ${scheme.ward}` : ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedScheme && (
        <Card elevation={0} sx={cardSx}>
          <CardContent sx={{ p: { xs: 1.6, sm: 2.2, md: 2.6 }, '&:last-child': { pb: { xs: 1.6, sm: 2.2, md: 2.6 } } }}>
            <SectionHeading
              step="2"
              title="Scheme Information"
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: { xs: 0.8, sm: 1 },
              }}
            >
              <ReadOnlyItem
                label="Sub-Division"
                value={selectedScheme.subDivision || user?.subDivision}
                icon={<PlaceRoundedIcon />}
              />
              <ReadOnlyItem
                label="System Type"
                value={selectedScheme.systemType}
                icon={<FactoryRoundedIcon />}
              />
              <ReadOnlyItem
                label="Design Capacity"
                value={selectedScheme.designCapacity}
                icon={<SpeedRoundedIcon />}
              />
              <ReadOnlyItem
                label="Operational Capacity"
                value={selectedScheme.operationalCapacity}
                icon={<WaterDropRoundedIcon />}
              />
              <ReadOnlyItem
                label="Running Hours"
                value={selectedScheme.runningHours}
                icon={<ScheduleRoundedIcon />}
              />
              <ReadOnlyItem
                label="Plant Start / Raw Water Time"
                value={selectedScheme.plantStartTime}
                icon={<ScheduleRoundedIcon />}
              />
            </Box>

          </CardContent>
        </Card>
      )}

      <Card
        elevation={0}
        sx={{
          ...cardSx,
          borderColor: normalSelected ? '#9bd0b4' : '#cfe4d8',
          background: normalSelected
            ? 'linear-gradient(135deg, #ecf9f2 0%, #f7fcf9 100%)'
            : 'linear-gradient(135deg, #f4fbf7 0%, #fbfefd 100%)',
        }}
      >
        <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2.25 } } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack direction="row" spacing={1.1} alignItems="flex-start">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: '#e6f6ed',
                  color: '#17844d',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14.5, fontWeight: 900, color: '#12683c' }}>
                  Quick normal update
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mt: 0.25, maxWidth: 470 }}>
                  If everything is normal, use this shortcut to fill standard operating status values automatically.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant={normalSelected ? 'contained' : 'outlined'}
              color="success"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={setNormal}
              disabled={submitting}
              sx={{
                minWidth: { sm: 220 },
                width: { xs: '100%', sm: 'auto' },
                borderRadius: 1.5,
                boxShadow: normalSelected ? '0 4px 14px rgba(23,132,77,0.18)' : 'none',
              }}
            >
              {normalSelected ? 'Normal status applied' : 'Yes, everything is normal'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: { xs: 1.6, sm: 2.2, md: 2.6 }, '&:last-child': { pb: { xs: 1.6, sm: 2.2, md: 2.6 } } }}>
          <SectionHeading
            step="3"
            title="Today&apos;s Outage Report"
          />

          <Stack spacing={1.55}>
            <Box>
              <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: '#5b6f83', mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.55 }}>
                Operational status
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Functional / Non-Functional</InputLabel>
                <Select
                  label="Functional / Non-Functional"
                  value={form.functionalStatus}
                  onChange={(e) => setField('functionalStatus', e.target.value)}
                  disabled={submitting}
                >
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="Non-Functional">Non-Functional</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
              <TextField
                fullWidth
                type="time"
                label="Plant End Time (Optional)"
                value={form.plantEndTime}
                onChange={(e) => setField('plantEndTime', e.target.value)}
                inputRef={plantEndTimeInputRef}
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                onClick={() => {
                  const input = plantEndTimeInputRef.current
                  if (input?.showPicker) {
                    try { input.showPicker() } catch { input.focus() }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="Select plant end time"
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          const input = plantEndTimeInputRef.current
                          if (!input) return
                          input.focus()
                          if (input.showPicker) {
                            try { input.showPicker() } catch { /* native picker fallback */ }
                          }
                        }}
                        sx={{ color: '#315b80' }}
                      >
                        <AccessTimeRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                    opacity: 0,
                    width: 0,
                    margin: 0,
                    padding: 0,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Water Production"
                type="number"
                value={form.waterProduction}
                onChange={(e) => setField('waterProduction', e.target.value)}
                disabled={submitting}
                inputProps={{ min: 0, inputMode: 'decimal' }}
                InputProps={{ endAdornment: <InputAdornment position="end">KL</InputAdornment> }}
              />
            </Box>

            <Divider sx={{ borderColor: '#edf0f3' }} />

            <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: '#5b6f83', textTransform: 'uppercase', letterSpacing: 0.55 }}>
              Plant and supply condition
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
              <FormControl fullWidth required>
                <InputLabel>Pump Status</InputLabel>
                <Select label="Pump Status" value={form.pumpStatus} onChange={(e) => setField('pumpStatus', e.target.value)} disabled={submitting}>
                  {['Working', 'Not Working', 'Stopped', 'Under Maintenance', 'Pump Failure', 'Not Available'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Chlorination Status</InputLabel>
                <Select label="Chlorination Status" value={form.chlorinationStatus} onChange={(e) => setField('chlorinationStatus', e.target.value)} disabled={submitting}>
                  {['Done', 'In Progress', 'Pending', 'Not Done', 'Not Required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
              <FormControl fullWidth required>
                <InputLabel>Power Supply Status</InputLabel>
                <Select label="Power Supply Status" value={form.powerStatus} onChange={(e) => setField('powerStatus', e.target.value)} disabled={submitting}>
                  {['Available', 'Not Available', 'Power Failure', 'Low Voltage', 'Intermittent Supply', 'Generator Running'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Water Supplied Today?</InputLabel>
                <Select label="Water Supplied Today?" value={form.waterSupplyStatus} onChange={(e) => setField('waterSupplyStatus', e.target.value)} disabled={submitting}>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ borderColor: '#edf0f3' }} />

            <Stack direction="row" spacing={0.75} alignItems="center">
              <BuildRoundedIcon sx={{ fontSize: 16, color: '#6a7d90' }} />
              <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: '#5b6f83', textTransform: 'uppercase', letterSpacing: 0.55 }}>
                Issue and action
              </Typography>
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Issues / Remarks</InputLabel>
              <Select label="Issues / Remarks" value={form.issues} onChange={(e) => setField('issues', e.target.value)} disabled={submitting}>
                <MenuItem value="">No Issue</MenuItem>
                {issueOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
              <FormHelperText>Select “Other” only when a listed option does not apply.</FormHelperText>
            </FormControl>

            {form.issues === 'Other' && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Other issue detail"
                value={form.otherIssue}
                onChange={(e) => setField('otherIssue', e.target.value)}
                disabled={submitting}
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Action Taken</InputLabel>
              <Select label="Action Taken" value={form.actionTaken} onChange={(e) => setField('actionTaken', e.target.value)} disabled={submitting}>
                {actionOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>


            <Divider sx={{ borderColor: '#edf0f3' }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '0.8fr 1.2fr' },
                gap: 1,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={resetForm}
                disabled={submitting}
                sx={{ borderRadius: 1.5 }}
              >
                Reset
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
                onClick={submit}
                disabled={submitting}
                sx={{
                  borderRadius: 1.5,
                  boxShadow: '0 6px 18px rgba(23,132,77,0.20)',
                  '&:hover': { boxShadow: '0 8px 22px rgba(23,132,77,0.26)' },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Daily Status'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={3500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccess(false)}
          sx={{ borderRadius: 1.5 }}
        >
          Daily status submitted successfully.
        </Alert>
      </Snackbar>
    </Stack>
  )
}

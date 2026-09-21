import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import InfoRoundedIcon from '@mui/icons-material/InfoRounded'
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
  borderRadius: 3,
  boxShadow: '0 10px 28px rgba(16,52,95,0.055)',
  overflow: 'visible',
}

function SummaryCard({ value, label, caption, icon, tone = 'blue' }) {
  const tones = {
    blue: { bg: '#edf5fc', fg: '#1768ac' },
    green: { bg: '#ecf8f1', fg: '#17844d' },
    amber: { bg: '#fff7e8', fg: '#b86b00' },
  }
  const palette = tones[tone] || tones.blue

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.35, sm: 1.55 },
        border: '1px solid #dce6ef',
        borderRadius: 2.5,
        minHeight: 92,
        bgcolor: '#ffffff',
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
        <Box minWidth={0}>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 23 },
              lineHeight: 1,
              fontWeight: 900,
              color: '#12365e',
            }}
          >
            {value}
          </Typography>
          <Typography sx={{ mt: 0.55, fontSize: 11.5, fontWeight: 800, color: '#263b50' }}>
            {label}
          </Typography>
          <Typography sx={{ mt: 0.2, fontSize: 9.5, color: 'text.secondary', lineHeight: 1.3 }}>
            {caption}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: palette.bg,
            color: palette.fg,
            flexShrink: 0,
            '& svg': { fontSize: 19 },
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  )
}

function SectionHeading({ step, title }) {
  return (
    <Box
      sx={{
        width: '100%',
        mb: { xs: 1.6, sm: 2 },
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="baseline"
        justifyContent="flex-end"
        flexWrap="wrap"
        useFlexGap
        sx={{
          width: '100%',
          minWidth: 0,
          textAlign: 'right',
        }}
      >
        {step && (
          <Typography
            component="span"
            sx={{
              fontSize: { xs: 9, sm: 9.5 },
              fontWeight: 900,
              color: '#1768ac',
              letterSpacing: 0.65,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            Step {step}
          </Typography>
        )}

        <Typography
          sx={{
            fontSize: { xs: 14.5, sm: 15.5 },
            fontWeight: 900,
            color: '#12365e',
            lineHeight: 1.25,
            textAlign: 'right',
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
        p: { xs: 1.05, sm: 1.25 },
        bgcolor: '#f7fafc',
        border: '1px solid #e0e8ef',
        borderRadius: 2,
        minHeight: { xs: 66, sm: 72 },
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={0.8} alignItems="center">
        <Box sx={{ color: '#6e8296', display: 'grid', placeItems: 'center', '& svg': { fontSize: 15 } }}>
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 9.5,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.55,
            fontWeight: 800,
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 800,
          color: '#263b50',
          mt: 0.65,
          wordBreak: 'break-word',
          lineHeight: 1.35,
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1, sm: 1.25 },
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
          sx={{ borderRadius: 2.5, border: '1px solid #f1d0ce' }}
        >
          {error}
        </Alert>
      )}

      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: { xs: 1.6, sm: 2.25, md: 2.75 }, '&:last-child': { pb: { xs: 1.6, sm: 2.25, md: 2.75 } } }}>
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
              sx={{
                bgcolor: '#ffffff',
                minHeight: 62,
                borderRadius: 2.25,
                '& .MuiSelect-select': {
                  py: { xs: 1.25, sm: 1.45 },
                  px: { xs: 1.4, sm: 1.75 },
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
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 1,
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

            {(selectedScheme.ward || selectedScheme.division || selectedScheme.zone) && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                mt={1.6}
                justifyContent="flex-end"
                sx={{ rowGap: 0.75 }}
              >
                {selectedScheme.ward && (
                  <Chip
                    label={`Ward ${selectedScheme.ward}`}
                    variant="outlined"
                    sx={{
                      height: 31,
                      borderRadius: 1.7,
                      bgcolor: '#ffffff',
                      borderColor: '#d5e0e9',
                      color: '#465d72',
                      fontWeight: 700,
                      '& .MuiChip-label': { px: 1.35, fontSize: 11 },
                    }}
                  />
                )}
                {selectedScheme.division && (
                  <Chip
                    label={selectedScheme.division}
                    variant="outlined"
                    sx={{
                      height: 31,
                      borderRadius: 1.7,
                      bgcolor: '#f7fbff',
                      borderColor: '#c9dceb',
                      color: '#244c70',
                      fontWeight: 700,
                      '& .MuiChip-label': { px: 1.45, fontSize: 11 },
                    }}
                  />
                )}
                {selectedScheme.zone && (
                  <Chip
                    label={selectedScheme.zone}
                    variant="outlined"
                    sx={{
                      height: 31,
                      borderRadius: 1.7,
                      bgcolor: '#f7fbff',
                      borderColor: '#c9dceb',
                      color: '#244c70',
                      fontWeight: 700,
                      '& .MuiChip-label': { px: 1.45, fontSize: 11 },
                    }}
                  />
                )}
              </Stack>
            )}
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
                  borderRadius: 2,
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
              sx={{
                minWidth: { sm: 220 },
                width: { xs: '100%', sm: 'auto' },
                borderRadius: 2,
                boxShadow: normalSelected ? '0 8px 18px rgba(23,132,77,0.18)' : 'none',
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
                >
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="Non-Functional">Non-Functional</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="input"
                  ref={plantEndTimeInputRef}
                  type="time"
                  value={form.plantEndTime}
                  onChange={(e) => setField('plantEndTime', e.target.value)}
                  sx={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                    left: 0,
                    bottom: 0,
                  }}
                />
                <TextField
                  fullWidth
                  label="Plant End Time (Optional)"
                  value={form.plantEndTime}
                  placeholder="Select time"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label="Select plant end time"
                          onClick={() => {
                            const input = plantEndTimeInputRef.current
                            if (input?.showPicker) input.showPicker()
                            else input?.click()
                          }}
                          sx={{ color: '#315b80' }}
                        >
                          <AccessTimeRoundedIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-input': { cursor: 'default' },
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="Water Production"
                type="number"
                value={form.waterProduction}
                onChange={(e) => setField('waterProduction', e.target.value)}
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
                <Select label="Pump Status" value={form.pumpStatus} onChange={(e) => setField('pumpStatus', e.target.value)}>
                  {['Working', 'Not Working', 'Stopped', 'Under Maintenance', 'Pump Failure', 'Not Available'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Chlorination Status</InputLabel>
                <Select label="Chlorination Status" value={form.chlorinationStatus} onChange={(e) => setField('chlorinationStatus', e.target.value)}>
                  {['Done', 'In Progress', 'Pending', 'Not Done', 'Not Required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1, sm: 1.25 }, minWidth: 0 }}>
              <FormControl fullWidth required>
                <InputLabel>Power Supply Status</InputLabel>
                <Select label="Power Supply Status" value={form.powerStatus} onChange={(e) => setField('powerStatus', e.target.value)}>
                  {['Available', 'Not Available', 'Power Failure', 'Low Voltage', 'Intermittent Supply', 'Generator Running'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Water Supplied Today?</InputLabel>
                <Select label="Water Supplied Today?" value={form.waterSupplyStatus} onChange={(e) => setField('waterSupplyStatus', e.target.value)}>
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
              <Select label="Issues / Remarks" value={form.issues} onChange={(e) => setField('issues', e.target.value)}>
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
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Action Taken</InputLabel>
              <Select label="Action Taken" value={form.actionTaken} onChange={(e) => setField('actionTaken', e.target.value)}>
                {actionOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>

            <Paper
              elevation={0}
              sx={{
                p: 1.1,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                border: '1px dashed #d7e1ea',
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <InfoRoundedIcon sx={{ color: '#1768ac', fontSize: 17 }} />
                <Typography sx={{ fontSize: 10.5, color: '#5b6f83' }}>
                  Review the selected scheme and daily values before submitting. Submitted data will be saved to the departmental report.
                </Typography>
              </Stack>
            </Paper>

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
                sx={{ borderRadius: 2 }}
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
                  borderRadius: 2,
                  boxShadow: '0 10px 22px rgba(23,132,77,0.20)',
                  '&:hover': { boxShadow: '0 12px 26px rgba(23,132,77,0.26)' },
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
          sx={{ borderRadius: 2 }}
        >
          Daily status submitted successfully.
        </Alert>
      </Snackbar>
    </Stack>
  )
}

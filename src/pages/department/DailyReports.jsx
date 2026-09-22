import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { DataGrid } from '@mui/x-data-grid'

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'

import { useAuth } from '../../auth/AuthContext'
import { apiRequest } from '../../api/api'


function getKolkataDate() {
  const formatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  )

  const values = {}

  formatter
    .formatToParts(new Date())
    .forEach((part) => {
      values[part.type] = part.value
    })

  return `${values.year}-${values.month}-${values.day}`
}


function formatDisplayDate(value) {
  const text = String(value || '').trim()

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) return text || '—'

  return `${match[3]}-${match[2]}-${match[1]}`
}


function uniqueValues(rows, key) {
  return Array.from(
    new Set(
      rows
        .map((row) => String(row?.[key] || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
}


function csvEscape(value) {
  const text = String(value ?? '')

  if (
    text.includes(',') ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')
  ) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}


function downloadCsv(fileName, rows) {
  const headers = [
    'Report Date',
    'Sl. No.',
    'Sub Division',
    'Ward',
    'Division',
    'Zone',
    'Name of Location',
    'Type of System',
    'Design Capacity',
    'Operational Capacity',
    'Functional / Non-Functional',
    'Running Hours',
    'Plant Start Time',
    'Plant End Time',
    'Water Production (KL)',
    'Pump Status',
    'Chlorination Status',
    'Power Supply Status',
    'Issues / Remarks',
    'Today Water Supply Status (Yes/No)',
    'Action Taken',
    'WhatsApp Sent',
    'WhatsApp Sent Time',
    'Report Key',
  ]

  const keys = [
    'reportDate',
    'slNo',
    'subDivision',
    'ward',
    'division',
    'zone',
    'location',
    'systemType',
    'designCapacity',
    'operationalCapacity',
    'functionalStatus',
    'runningHours',
    'plantStartTime',
    'plantEndTime',
    'waterProduction',
    'pumpStatus',
    'chlorinationStatus',
    'powerStatus',
    'issues',
    'waterSupplyStatus',
    'actionTaken',
    'whatsappSent',
    'whatsappSentTime',
    'reportKey',
  ]

  const csvRows = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) =>
      keys
        .map((key) => {
          if (key === 'whatsappSent') {
            return csvEscape(row.whatsappSent ? 'TRUE' : 'FALSE')
          }

          return csvEscape(row[key])
        })
        .join(',')
    ),
  ]

  const blob = new Blob(
    [`\uFEFF${csvRows.join('\r\n')}`],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}


async function copyText(text) {
  const value = String(text || '')

  if (!value) return false

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch (error) {
    console.warn('Clipboard API failed, using fallback:', error)
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'

    document.body.appendChild(textarea)
    textarea.select()

    const copied = document.execCommand('copy')

    textarea.remove()

    return copied
  } catch (error) {
    console.error('Clipboard fallback failed:', error)
    return false
  }
}


function StatusChip({ value, type }) {
  const text = String(value || '').trim()

  if (!text) {
    return (
      <Chip
        size="small"
        label="—"
        variant="outlined"
        sx={{
          height: 24,
          fontWeight: 700,
        }}
      />
    )
  }

  let color = 'default'

  if (type === 'functional') {
    color = text.toLowerCase() === 'functional' ? 'success' : 'error'
  }

  if (type === 'supply') {
    color = text.toLowerCase() === 'yes' ? 'success' : 'warning'
  }

  return (
    <Chip
      size="small"
      label={text}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{
        height: 24,
        fontWeight: 700,
        fontSize: 11,
      }}
    />
  )
}


function MiniMetric({ label, value, tone = 'default' }) {
  const tones = {
    default: {
      bgcolor: '#F5F8FB',
      color: '#334E68',
      borderColor: '#E2E8F0',
    },
    success: {
      bgcolor: '#EFFAF4',
      color: '#166534',
      borderColor: '#CDEEDB',
    },
    danger: {
      bgcolor: '#FFF4F3',
      color: '#A82720',
      borderColor: '#F4D3D0',
    },
    warning: {
      bgcolor: '#FFF8EB',
      color: '#9A5B00',
      borderColor: '#F6D89B',
    },
  }

  const style = tones[tone] || tones.default

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.7,
        borderRadius: 99,
        border: '1px solid',
        ...style,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          opacity: 0.82,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}


function ValueLine({ label, value, emphasis = false }) {
  const text = String(value ?? '').trim()

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          flexShrink: 0,
          lineHeight: 1.45,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          fontWeight: emphasis ? 750 : 600,
          color: emphasis ? '#102A43' : '#334E68',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.45,
        }}
      >
        {text || '—'}
      </Typography>
    </Box>
  )
}


function DailyReports() {
  const { token } = useAuth()

  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(getKolkataDate())
  const [report, setReport] = useState(null)

  const [loadingDates, setLoadingDates] = useState(true)
  const [loadingReport, setLoadingReport] = useState(true)
  const [exportingAll, setExportingAll] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [preparingWhatsApp, setPreparingWhatsApp] = useState(false)
  const [confirmingWhatsApp, setConfirmingWhatsApp] = useState(false)
  const [whatsAppDialogOpen, setWhatsAppDialogOpen] = useState(false)
  const [preparedWhatsApp, setPreparedWhatsApp] = useState(null)
  const [whatsAppOpened, setWhatsAppOpened] = useState(false)
  const [summaryCopied, setSummaryCopied] = useState(false)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [ward, setWard] = useState('ALL')
  const [division, setDivision] = useState('ALL')
  const [zone, setZone] = useState('ALL')
  const [subDivision, setSubDivision] = useState('ALL')
  const [functional, setFunctional] = useState('ALL')
  const [waterSupply, setWaterSupply] = useState('ALL')
  const [whatsapp, setWhatsapp] = useState('ALL')


  const loadAvailableDates = useCallback(async () => {
    if (!token) return

    try {
      setLoadingDates(true)
      setError('')

      const result = await apiRequest(
        'getDailyReportDates',
        { token }
      )

      if (!result?.success) {
        throw new Error(result?.message || 'Report dates could not be loaded.')
      }

      const dates = Array.isArray(result.dates)
        ? result.dates
        : []

      setAvailableDates(dates)

      if (dates.length > 0) {
        setSelectedDate((current) =>
          dates.includes(current) ? current : dates[0]
        )
      }
    } catch (err) {
      console.error('Daily report dates error:', err)
      setError(err?.message || 'Report dates could not be loaded.')
    } finally {
      setLoadingDates(false)
    }
  }, [token])


  const loadReport = useCallback(async () => {
    if (!token || !selectedDate) return

    try {
      setLoadingReport(true)
      setError('')

      const result = await apiRequest(
        'getDailyOutageReport',
        {
          token,
          reportDate: selectedDate,
        }
      )

      if (!result?.success) {
        throw new Error(result?.message || 'Daily outage report could not be loaded.')
      }

      setReport(result)
    } catch (err) {
      console.error('Daily outage report error:', err)
      setError(err?.message || 'Daily outage report could not be loaded.')
      setReport(null)
    } finally {
      setLoadingReport(false)
    }
  }, [token, selectedDate])


  useEffect(() => {
    loadAvailableDates()
  }, [loadAvailableDates])


  useEffect(() => {
    loadReport()
  }, [loadReport])


  useEffect(() => {
    setWhatsAppDialogOpen(false)
    setPreparedWhatsApp(null)
    setWhatsAppOpened(false)
    setSummaryCopied(false)
    setSuccess('')
  }, [selectedDate])


  const rows = report?.rows || []


  const filterOptions = useMemo(() => ({
    wards: uniqueValues(rows, 'ward'),
    divisions: uniqueValues(rows, 'division'),
    zones: uniqueValues(rows, 'zone'),
    subDivisions: uniqueValues(rows, 'subDivision'),
  }), [rows])


  const filteredRows = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (ward !== 'ALL' && String(row.ward || '') !== ward) return false
      if (division !== 'ALL' && String(row.division || '') !== division) return false
      if (zone !== 'ALL' && String(row.zone || '') !== zone) return false
      if (subDivision !== 'ALL' && String(row.subDivision || '') !== subDivision) return false
      if (functional !== 'ALL' && String(row.functionalStatus || '') !== functional) return false
      if (waterSupply !== 'ALL' && String(row.waterSupplyStatus || '') !== waterSupply) return false

      if (whatsapp === 'SENT' && !row.whatsappSent) return false
      if (whatsapp === 'PENDING' && row.whatsappSent) return false

      if (searchText) {
        const haystack = [
          row.location,
          row.subDivision,
          row.ward,
          row.division,
          row.zone,
          row.systemType,
          row.issues,
          row.actionTaken,
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(searchText)) return false
      }

      return true
    })
  }, [
    rows,
    search,
    ward,
    division,
    zone,
    subDivision,
    functional,
    waterSupply,
    whatsapp,
  ])


  const whatsappSentCount = useMemo(
    () => rows.filter((row) => row.whatsappSent).length,
    [rows]
  )

  const whatsappPendingCount = rows.length - whatsappSentCount

  const functionalCount = useMemo(
    () => rows.filter(
      (row) => String(row.functionalStatus || '').trim().toLowerCase() === 'functional'
    ).length,
    [rows]
  )

  const nonFunctionalCount = rows.length - functionalCount

  const activeFilterCount = useMemo(() => {
    let count = 0

    if (ward !== 'ALL') count++
    if (division !== 'ALL') count++
    if (zone !== 'ALL') count++
    if (subDivision !== 'ALL') count++
    if (functional !== 'ALL') count++
    if (waterSupply !== 'ALL') count++
    if (whatsapp !== 'ALL') count++

    return count
  }, [
    ward,
    division,
    zone,
    subDivision,
    functional,
    waterSupply,
    whatsapp,
  ])


  const clearFilters = () => {
    setSearch('')
    setWard('ALL')
    setDivision('ALL')
    setZone('ALL')
    setSubDivision('ALL')
    setFunctional('ALL')
    setWaterSupply('ALL')
    setWhatsapp('ALL')
  }


  const selectedDateIndex = availableDates.indexOf(selectedDate)

  const olderDate =
    selectedDateIndex >= 0 && selectedDateIndex < availableDates.length - 1
      ? availableDates[selectedDateIndex + 1]
      : null

  const newerDate =
    selectedDateIndex > 0
      ? availableDates[selectedDateIndex - 1]
      : null


  const exportCurrent = () => {
    if (!filteredRows.length) return

    downloadCsv(
      `TJB_Daily_Outage_Report_${selectedDate}.csv`,
      filteredRows
    )
  }


  const exportAll = async () => {
    if (!token) return

    try {
      setExportingAll(true)
      setError('')

      const result = await apiRequest(
        'getAllDailyOutageReports',
        { token }
      )

      if (!result?.success) {
        throw new Error(result?.message || 'All-date export could not be prepared.')
      }

      const allRows = Array.isArray(result.rows) ? result.rows : []

      if (!allRows.length) {
        throw new Error('No report rows are available to export.')
      }

      downloadCsv(
        'TJB_All_Daily_Outage_Reports.csv',
        allRows
      )
    } catch (err) {
      console.error('All date export error:', err)
      setError(err?.message || 'All-date export failed.')
    } finally {
      setExportingAll(false)
    }
  }


  const handlePrepareWhatsApp = async () => {
    if (!token || !selectedDate) return

    const whatsappWindow = window.open(
      'about:blank',
      'tjb_office_whatsapp'
    )

    try {
      setPreparingWhatsApp(true)
      setError('')
      setSuccess('')
      setWhatsAppOpened(false)
      setSummaryCopied(false)

      const result = await apiRequest(
        'prepareDailyWhatsApp',
        {
          token,
          reportDate: selectedDate,
        }
      )

      if (!result?.success) {
        throw new Error(
          result?.message ||
          'WhatsApp summary could not be prepared.'
        )
      }

      if (!result?.pendingCount) {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close()
        }

        setPreparedWhatsApp(null)
        setWhatsAppDialogOpen(false)

        setSuccess(
          result?.message ||
          'All rows for this date are already marked as WhatsApp Sent.'
        )

        await loadReport()
        return
      }

      const prepared = {
        ...result,
        alreadySentCount: Math.max(
          0,
          rows.length - Number(result.pendingCount || 0)
        ),
      }

      setPreparedWhatsApp(prepared)
      setWhatsAppDialogOpen(true)

      if (
        result.whatsappUrl &&
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.location.href = result.whatsappUrl
        setWhatsAppOpened(true)
      } else if (
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.close()
      }
    } catch (err) {
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close()
      }

      console.error('Prepare WhatsApp report error:', err)

      setError(
        err?.message ||
        'WhatsApp summary could not be prepared.'
      )
    } finally {
      setPreparingWhatsApp(false)
    }
  }


  const handleCopyWhatsAppSummary = async () => {
    const copied = await copyText(
      preparedWhatsApp?.message
    )

    setSummaryCopied(copied)

    if (!copied) {
      setError(
        'Summary could not be copied automatically. You can still select and copy the text manually.'
      )
    }
  }


  const handleOpenWhatsApp = () => {
    const url = String(
      preparedWhatsApp?.whatsappUrl || ''
    ).trim()

    if (!url) {
      setError(
        'WhatsApp link is not available.'
      )
      return
    }

    const opened = window.open(
      url,
      'tjb_office_whatsapp'
    )

    if (opened) {
      setWhatsAppOpened(true)
      opened.focus?.()
    } else {
      setError(
        'Browser blocked the WhatsApp window. Allow pop-ups for this portal and click Open WhatsApp again.'
      )
    }
  }


  const handleConfirmWhatsAppSent = async () => {
    if (
      !token ||
      !preparedWhatsApp?.reportKeys?.length
    ) {
      return
    }

    try {
      setConfirmingWhatsApp(true)
      setError('')
      setSuccess('')

      const result = await apiRequest(
        'confirmDailyWhatsAppSent',
        {
          token,
          reportDate: selectedDate,
          reportKeys: preparedWhatsApp.reportKeys,
        }
      )

      if (!result?.success) {
        throw new Error(
          result?.message ||
          'WhatsApp delivery could not be confirmed.'
        )
      }

      setWhatsAppDialogOpen(false)
      setPreparedWhatsApp(null)
      setWhatsAppOpened(false)
      setSummaryCopied(false)

      setSuccess(
        result?.message ||
        `${result?.dailyMasterUpdated || 0} report row(s) marked as WhatsApp Sent.`
      )

      await loadReport()
    } catch (err) {
      console.error('Confirm WhatsApp sent error:', err)
      setError(
        err?.message ||
        'WhatsApp delivery could not be confirmed.'
      )
    } finally {
      setConfirmingWhatsApp(false)
    }
  }


  const handleCloseWhatsAppDialog = () => {
    if (confirmingWhatsApp) return

    setWhatsAppDialogOpen(false)
    setPreparedWhatsApp(null)
    setWhatsAppOpened(false)
    setSummaryCopied(false)
  }


  const columns = useMemo(() => [
    {
      field: 'slNo',
      headerName: 'Sl.',
      width: 56,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
    },
    {
      field: 'location',
      headerName: 'Scheme / Area',
      minWidth: 255,
      flex: 1.15,
      sortable: true,
      renderCell: (params) => {
        const row = params.row || {}

        return (
          <Box sx={{ minWidth: 0, py: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: '#102A43',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {row.location || '—'}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {[row.subDivision, row.ward].filter(Boolean).join('  •  ') || 'Area not mapped'}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {[row.division, row.zone].filter(Boolean).join('  •  ') || '—'}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'systemType',
      headerName: 'System',
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => {
        const row = params.row || {}

        return (
          <Box sx={{ py: 1, width: '100%' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: '#102A43' }}
            >
              {row.systemType || '—'}
            </Typography>
            <ValueLine label="Design" value={row.designCapacity} />
            <ValueLine label="Operational" value={row.operationalCapacity} />
          </Box>
        )
      },
    },
    {
      field: 'functionalStatus',
      headerName: 'Status',
      minWidth: 145,
      flex: 0.65,
      renderCell: (params) => {
        const row = params.row || {}

        return (
          <Stack spacing={0.7} alignItems="flex-start" sx={{ py: 1 }}>
            <StatusChip value={row.functionalStatus} type="functional" />
            <StatusChip value={row.waterSupplyStatus} type="supply" />
          </Stack>
        )
      },
    },
    {
      field: 'plantEndTime',
      headerName: 'Operating Time',
      minWidth: 155,
      flex: 0.72,
      renderCell: (params) => {
        const row = params.row || {}

        return (
          <Box sx={{ py: 1, width: '100%' }}>
            <ValueLine label="Start" value={row.plantStartTime} emphasis />
            <ValueLine label="End" value={row.plantEndTime} emphasis />
            <ValueLine label="Running" value={row.runningHours} />
          </Box>
        )
      },
    },
    {
      field: 'waterProduction',
      headerName: 'Production & Utilities',
      minWidth: 185,
      flex: 0.9,
      renderCell: (params) => {
        const row = params.row || {}

        return (
          <Box sx={{ py: 1, width: '100%' }}>
            <ValueLine label="Production" value={row.waterProduction} emphasis />
            <ValueLine label="Pump" value={row.pumpStatus} />
            <ValueLine label="Chlorination" value={row.chlorinationStatus} />
            <ValueLine label="Power" value={row.powerStatus} />
          </Box>
        )
      },
    },
    {
      field: 'issues',
      headerName: 'Issue / Action',
      minWidth: 245,
      flex: 1.1,
      renderCell: (params) => {
        const row = params.row || {}
        const issue = String(row.issues || '').trim()
        const action = String(row.actionTaken || '').trim()

        return (
          <Box sx={{ py: 1, minWidth: 0, width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: issue ? 750 : 600,
                color: issue ? '#334E68' : '#829AB1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={issue || 'No issue reported'}
            >
              {issue || 'No issue reported'}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mt: 0.45,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={action || 'No action recorded'}
            >
              {action || 'No action recorded'}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'whatsappSent',
      headerName: 'WhatsApp',
      width: 116,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? 'Sent' : 'Pending'}
          color={params.value ? 'success' : 'warning'}
          variant={params.value ? 'filled' : 'outlined'}
          sx={{
            height: 26,
            fontWeight: 800,
            fontSize: 11,
          }}
        />
      ),
    },
  ], [])


  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1600,
        mx: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'flex-start' }}
        spacing={2}
        sx={{ mb: 2.25 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 850,
              letterSpacing: '-0.02em',
              color: '#102A43',
              fontSize: { xs: 25, md: 30 },
              lineHeight: 1.18,
            }}
          >
            Daily Outage Report
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.6 }}
          >
            Review daily operations, identify service interruptions and manage report delivery.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
          flexWrap="wrap"
          useFlexGap
        >
          <Tooltip title="Refresh report and available dates">
            <span>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  loadAvailableDates()
                  loadReport()
                }}
                disabled={loadingDates || loadingReport}
              >
                Refresh
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            color="error"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportCurrent}
            disabled={!filteredRows.length}
          >
            Export Report
          </Button>

          <Tooltip title="Export every available report date">
            <span>
              <IconButton
                onClick={exportAll}
                disabled={exportingAll}
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#FFFFFF',
                }}
              >
                {exportingAll
                  ? <CircularProgress size={18} />
                  : <DownloadRoundedIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>

          {report?.fileUrl && (
            <Tooltip title="Open the original Google Sheet">
              <IconButton
                onClick={() => window.open(report.fileUrl, '_blank', 'noopener,noreferrer')}
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#FFFFFF',
                }}
              >
                <OpenInNewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 1.5 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 1.5 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }
        }}
      >
        <Box
          sx={{
            p: { xs: 1.75, md: 2 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1fr) auto',
            },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                bgcolor: '#F5F8FB',
                border: '1px solid #E2E8F0',
                borderRadius: 2,
                p: 0.35,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Tooltip title="Previous available report day">
                <span>
                  <IconButton
                    size="small"
                    disabled={!olderDate}
                    onClick={() => olderDate && setSelectedDate(olderDate)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <ChevronLeftRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: 0, sm: 190 },
                  flex: { xs: 1, sm: 'initial' },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFFFF',
                  },
                }}
              />

              <Tooltip title="Next available report day">
                <span>
                  <IconButton
                    size="small"
                    disabled={!newerDate}
                    onClick={() => newerDate && setSelectedDate(newerDate)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <ChevronRightRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 190 },
              }}
            >
              <InputLabel>Available reports</InputLabel>
              <Select
                value={availableDates.includes(selectedDate) ? selectedDate : ''}
                label="Available reports"
                onChange={(event) => setSelectedDate(event.target.value)}
              >
                {availableDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {formatDisplayDate(date)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction="row"
            spacing={0.8}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
          >
            <MiniMetric label="Rows" value={rows.length} />
            <MiniMetric label="Functional" value={functionalCount} tone="success" />
            <MiniMetric label="Non-functional" value={nonFunctionalCount} tone="danger" />
            <MiniMetric label="WhatsApp pending" value={whatsappPendingCount} tone="warning" />
          </Stack>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }
        }}
      >
        <Box
          sx={{
            px: { xs: 1.75, md: 2 },
            py: 1.75,
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', xl: 'center' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  sx={{
                    fontWeight: 850,
                    color: '#102A43',
                    fontSize: 16,
                  }}
                >
                  Report for {formatDisplayDate(selectedDate)}
                </Typography>

                {filteredRows.length !== rows.length && (
                  <Chip
                    size="small"
                    label={`${filteredRows.length} of ${rows.length} rows`}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                Operational details are grouped for faster review. Use filters only when you need to narrow the report.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                size="small"
                placeholder="Search scheme, ward or issue"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 19, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: 0, sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8FAFC',
                  },
                }}
              />

              <Badge
                badgeContent={activeFilterCount}
                color="primary"
                invisible={activeFilterCount === 0}
              >
                <Button
                  variant={filtersOpen || activeFilterCount ? 'contained' : 'outlined'}
                  startIcon={<TuneRoundedIcon />}
                  onClick={() => setFiltersOpen((current) => !current)}
                >
                  Filters
                </Button>
              </Badge>

              <Tooltip
                title={
                  whatsappPendingCount > 0
                    ? 'Prepare only rows that have not yet been marked as WhatsApp Sent.'
                    : 'All report rows for this date are already marked as WhatsApp Sent.'
                }
              >
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={
                      preparingWhatsApp
                        ? <CircularProgress size={18} color="inherit" />
                        : <WhatsAppIcon />
                    }
                    onClick={handlePrepareWhatsApp}
                    disabled={
                      preparingWhatsApp ||
                      loadingReport ||
                      !report?.reportExists ||
                      !rows.length ||
                      whatsappPendingCount === 0
                    }
                    sx={{
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preparingWhatsApp
                      ? 'Preparing...'
                      : whatsappPendingCount === 0 && rows.length
                        ? 'WhatsApp Complete'
                        : `Send Pending (${whatsappPendingCount})`}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
          <Box
            sx={{
              px: { xs: 1.75, md: 2 },
              py: 1.75,
              bgcolor: '#F8FAFC',
              borderBottom: '1px solid #E9EFF5',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              <FilterSelect
                label="Ward"
                value={ward}
                onChange={setWard}
                options={filterOptions.wards}
              />

              <FilterSelect
                label="Division"
                value={division}
                onChange={setDivision}
                options={filterOptions.divisions}
              />

              <FilterSelect
                label="Zone"
                value={zone}
                onChange={setZone}
                options={filterOptions.zones}
              />

              <FilterSelect
                label="Sub Division"
                value={subDivision}
                onChange={setSubDivision}
                options={filterOptions.subDivisions}
              />

              <FilterSelect
                label="Functional Status"
                value={functional}
                onChange={setFunctional}
                options={['Functional', 'Non-Functional']}
              />

              <FilterSelect
                label="Water Supply"
                value={waterSupply}
                onChange={setWaterSupply}
                options={['Yes', 'No']}
              />

              <FilterSelect
                label="WhatsApp Status"
                value={whatsapp}
                onChange={setWhatsapp}
                options={['SENT', 'PENDING']}
                labels={{ SENT: 'Sent', PENDING: 'Pending' }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'stretch', lg: 'flex-end' },
                }}
              >
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<FilterAltOffRoundedIcon />}
                  onClick={clearFilters}
                  disabled={!activeFilterCount && !search}
                  sx={{
                    justifyContent: { xs: 'center', lg: 'flex-end' },
                  }}
                >
                  Clear all filters
                </Button>
              </Box>
            </Box>
          </Box>
        </Collapse>

        {loadingReport ? (
          <Box
            sx={{
              minHeight: 420,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading daily report...
              </Typography>
            </Stack>
          </Box>
        ) : !report?.reportExists ? (
          <Box
            sx={{
              minHeight: 360,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800} color="#102A43">
                No report available for this date
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                No Water_Supply_Report_{selectedDate} sheet exists inside the Daily Reports folder.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.id}
              rowHeight={94}
              columnHeaderHeight={52}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                    page: 0,
                  },
                },
              }}
              getRowClassName={(params) => {
                const status = String(params.row?.functionalStatus || '').toLowerCase()
                const supply = String(params.row?.waterSupplyStatus || '').toLowerCase()

                if (status === 'non-functional') return 'row-non-functional'
                if (supply === 'no') return 'row-disrupted'
                return ''
              }}
              sx={{
                border: 0,
                color: '#243B53',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F8FAFC',
                  borderBottom: '1px solid #F1F5F9',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 850,
                  color: '#0F172A',
                  fontSize: 12.5,
                },
                '& .MuiDataGrid-cell': {
                  alignItems: 'center',
                  borderColor: '#F1F5F9',
                  py: 0,
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: '#F8FAFC',
                },
                '& .row-non-functional': {
                  bgcolor: 'rgba(199, 54, 47, 0.035)',
                },
                '& .row-disrupted': {
                  bgcolor: 'rgba(184, 107, 0, 0.035)',
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: 52,
                  borderTop: '1px solid #F1F5F9',
                },
                '& .MuiDataGrid-virtualScroller': {
                  bgcolor: '#FFFFFF',
                },
              }}
            />
          </Box>
        )}
      </Paper>

      <Dialog
        open={whatsAppDialogOpen}
        onClose={handleCloseWhatsAppDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 850,
            color: '#102A43',
            pb: 1,
          }}
        >
          WhatsApp delivery
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              The summary includes only rows that are currently <b>Pending</b>.
              After sending it from the office WhatsApp account, return here and
              confirm the delivery status.
            </Alert>

            <Stack
              direction="row"
              spacing={0.8}
              useFlexGap
              flexWrap="wrap"
            >
              <MiniMetric
                label="Report date"
                value={formatDisplayDate(preparedWhatsApp?.reportDate || selectedDate)}
              />
              <MiniMetric
                label="Pending"
                value={preparedWhatsApp?.pendingCount || 0}
                tone="warning"
              />
              <MiniMetric
                label="Already sent"
                value={preparedWhatsApp?.alreadySentCount || 0}
                tone="success"
              />
            </Stack>

            <Box
              sx={{
                border: '1px solid #DCE6EF',
                borderRadius: 2,
                bgcolor: '#F8FAFC',
                p: 1.5,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                MESSAGE PREVIEW
              </Typography>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  mt: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: '#243B53',
                  maxHeight: 340,
                  overflow: 'auto',
                }}
              >
                {preparedWhatsApp?.message || ''}
              </Box>
            </Box>

            {summaryCopied && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Summary copied to the clipboard.
              </Alert>
            )}

            {whatsAppOpened && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Confirm below only after you have actually pressed <b>Send</b> in WhatsApp.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={handleCloseWhatsAppDialog}
            disabled={confirmingWhatsApp}
          >
            Close
          </Button>

          <Button
            variant="outlined"
            startIcon={<ContentCopyRoundedIcon />}
            onClick={handleCopyWhatsAppSummary}
            disabled={!preparedWhatsApp?.message || confirmingWhatsApp}
          >
            Copy
          </Button>

          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            onClick={handleOpenWhatsApp}
            disabled={!preparedWhatsApp?.whatsappUrl || confirmingWhatsApp}
          >
            Open WhatsApp
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={
              confirmingWhatsApp
                ? <CircularProgress size={18} color="inherit" />
                : <WhatsAppIcon />
            }
            onClick={handleConfirmWhatsAppSent}
            disabled={
              confirmingWhatsApp ||
              !whatsAppOpened ||
              !preparedWhatsApp?.reportKeys?.length
            }
          >
            {confirmingWhatsApp
              ? 'Updating...'
              : 'Confirm Sent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}


function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels = {},
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(event) => onChange(event.target.value)}
        sx={{ bgcolor: '#FFFFFF' }}
      >
        <MenuItem value="ALL">All</MenuItem>

        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {labels[option] || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}


export default DailyReports

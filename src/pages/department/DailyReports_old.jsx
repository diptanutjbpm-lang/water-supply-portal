import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
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


function StatusChip({ value, type }) {
  const text = String(value || '').trim()

  if (!text) {
    return <Chip size="small" label="—" variant="outlined" />
  }

  let color = 'default'

  if (type === 'functional') {
    color = text.toLowerCase() === 'functional' ? 'success' : 'error'
  }

  if (type === 'supply') {
    color = text.toLowerCase() === 'yes' ? 'success' : 'error'
  }

  return (
    <Chip
      size="small"
      label={text}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 700 }}
    />
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


  const columns = useMemo(() => [
    {
      field: 'slNo',
      headerName: 'Sl.',
      width: 65,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'subDivision',
      headerName: 'Sub Division',
      minWidth: 190,
      flex: 1,
    },
    {
      field: 'ward',
      headerName: 'Ward',
      minWidth: 120,
    },
    {
      field: 'division',
      headerName: 'Division',
      minWidth: 130,
    },
    {
      field: 'zone',
      headerName: 'Zone',
      minWidth: 120,
    },
    {
      field: 'location',
      headerName: 'Scheme / Location',
      minWidth: 220,
      flex: 1.15,
    },
    {
      field: 'systemType',
      headerName: 'System Type',
      minWidth: 120,
    },
    {
      field: 'functionalStatus',
      headerName: 'Functional Status',
      minWidth: 170,
      renderCell: (params) => (
        <StatusChip value={params.value} type="functional" />
      ),
    },
    {
      field: 'waterSupplyStatus',
      headerName: 'Water Supplied?',
      minWidth: 150,
      renderCell: (params) => (
        <StatusChip value={params.value} type="supply" />
      ),
    },
    {
      field: 'plantEndTime',
      headerName: 'Plant End Time',
      minWidth: 140,
    },
    {
      field: 'waterProduction',
      headerName: 'Water Production',
      minWidth: 145,
    },
    {
      field: 'pumpStatus',
      headerName: 'Pump',
      minWidth: 110,
    },
    {
      field: 'chlorinationStatus',
      headerName: 'Chlorination',
      minWidth: 135,
    },
    {
      field: 'powerStatus',
      headerName: 'Power',
      minWidth: 120,
    },
    {
      field: 'issues',
      headerName: 'Issues / Remarks',
      minWidth: 220,
      flex: 1,
    },
    {
      field: 'actionTaken',
      headerName: 'Action Taken',
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'whatsappSent',
      headerName: 'WhatsApp',
      minWidth: 125,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? 'Sent' : 'Pending'}
          color={params.value ? 'success' : 'warning'}
          variant={params.value ? 'filled' : 'outlined'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ], [])


  return (
    <Box>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#102A43',
              fontSize: { xs: 24, md: 30 },
            }}
          >
            View Daily Outage Report
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Date-wise departmental water supply report, filters, export and WhatsApp tracking
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
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

          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={exportCurrent}
            disabled={!filteredRows.length}
          >
            Export Current
          </Button>

          <Button
            variant="outlined"
            startIcon={exportingAll ? <CircularProgress size={17} /> : <DownloadRoundedIcon />}
            onClick={exportAll}
            disabled={exportingAll}
          >
            Export All Dates
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          borderColor: '#E2E8F0',
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', lg: 'center' }}
          >
            <Button
              variant="outlined"
              startIcon={<ChevronLeftRoundedIcon />}
              disabled={!olderDate}
              onClick={() => olderDate && setSelectedDate(olderDate)}
            >
              Previous Day
            </Button>

            <TextField
              type="date"
              label="Report Date"
              size="small"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              sx={{ minWidth: 175 }}
            />

            <Button
              variant="outlined"
              endIcon={<ChevronRightRoundedIcon />}
              disabled={!newerDate}
              onClick={() => newerDate && setSelectedDate(newerDate)}
            >
              Next Day
            </Button>

            <FormControl size="small" sx={{ minWidth: 210 }}>
              <InputLabel>Available Report Dates</InputLabel>
              <Select
                value={availableDates.includes(selectedDate) ? selectedDate : ''}
                label="Available Report Dates"
                onChange={(event) => setSelectedDate(event.target.value)}
              >
                {availableDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flex: 1 }} />

            {report?.fileUrl && (
              <Button
                variant="contained"
                startIcon={<OpenInNewRoundedIcon />}
                onClick={() => window.open(report.fileUrl, '_blank', 'noopener,noreferrer')}
              >
                Open Original Sheet
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip label={`Total rows: ${rows.length}`} />
            <Chip label={`Visible: ${filteredRows.length}`} />
            <Chip color="success" label={`WhatsApp Sent: ${whatsappSentCount}`} />
            <Chip color="warning" variant="outlined" label={`WhatsApp Pending: ${whatsappPendingCount}`} />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          borderColor: '#E2E8F0',
        }}
      >
        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
          Filters
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            label="Search location / issue"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

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
        </Box>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
          <Button
            size="small"
            startIcon={<FilterAltOffRoundedIcon />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          borderColor: '#E2E8F0',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #EDF2F7',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={1.5}
          >
            <Box>
              <Typography sx={{ fontWeight: 800 }}>
                Daily Report — {selectedDate}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The grid reads the selected Daily Reports master sheet. WhatsApp status is joined using Report Key.
              </Typography>
            </Box>

            <Tooltip title="Actual WhatsApp sending will be enabled after the provider/API integration. Only pending rows will be eligible.">
              <span>
                <Button
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  disabled
                >
                  Send Daily Outage Report
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        {loadingReport ? (
          <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading daily report...
              </Typography>
            </Stack>
          </Box>
        ) : !report?.reportExists ? (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                No Daily Master Report found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                No Water_Supply_Report_{selectedDate} Google Sheet exists inside the Daily Reports folder.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.id}
              rowHeight={58}
              columnHeaderHeight={58}
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
              sx={{
                border: 0,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#F5F8FB',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 800,
                },
                '& .MuiDataGrid-cell': {
                  alignItems: 'center',
                },
              }}
            />
          </Box>
        )}
      </Paper>
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

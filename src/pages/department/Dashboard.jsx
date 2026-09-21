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
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import FactoryRoundedIcon from '@mui/icons-material/FactoryRounded'
import PercentRoundedIcon from '@mui/icons-material/PercentRounded'

import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'

import { useAuth } from '../../auth/AuthContext'
import { apiRequest } from '../../api/api'


function getKolkataDate() {
  const formatter =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    )

  const parts =
    formatter.formatToParts(
      new Date()
    )

  const values = {}

  parts.forEach((part) => {
    values[part.type] = part.value
  })

  return `${values.year}-${values.month}-${values.day}`
}


function formatNumber(value) {
  const number =
    Number(value || 0)

  return new Intl.NumberFormat(
    'en-IN',
    {
      maximumFractionDigits: 2,
    }
  ).format(number)
}


function MetricCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 3,
        minHeight: 130,
        bgcolor: '#FFFFFF',
        borderColor: '#E2E8F0',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              fontSize: {
                xs: 26,
                lg: 30,
              },
              fontWeight: 800,
              color: '#102A43',
              lineHeight: 1.15,
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.75,
                display: 'block',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: '#EEF5FB',
            color: '#0B5FA5',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  )
}


function SectionCard({
  title,
  subtitle,
  children,
  action,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 2,
          borderBottom: '1px solid #EDF2F7',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 750,
                color: '#102A43',
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {action}
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  )
}


function NoData({
  message = 'No data available for the selected date.',
}) {
  return (
    <Box
      sx={{
        minHeight: 250,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Box>
        <WaterDropRoundedIcon
          sx={{
            fontSize: 42,
            color: '#B8C7D9',
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  )
}


function Dashboard() {
  const { token } =
    useAuth()

  const [selectedDate, setSelectedDate] =
    useState(
      getKolkataDate()
    )

  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [lastUpdated, setLastUpdated] =
    useState(null)


  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {

        if (!token) {
          return
        }

        try {
          setError('')

          if (silent) {
            setRefreshing(true)
          } else {
            setLoading(true)
          }

          const result = await apiRequest(
  'getAdminDashboard',
  {
    token,
    reportDate: selectedDate,
  }
)

          if (!result?.success) {
            throw new Error(
              result?.message ||
              'Dashboard data could not be loaded.'
            )
          }

          setDashboard(
            result
          )

          setLastUpdated(
            new Date()
          )

        } catch (err) {

          console.error(
            'Admin dashboard error:',
            err
          )

          setError(
            err?.message ||
            'Dashboard data could not be loaded.'
          )

        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      [
        token,
        selectedDate,
      ]
    )


  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])


  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          loadDashboard({
            silent: true,
          })
        },
        60000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [loadDashboard])


  const summary =
    dashboard?.summary || {}


  const functionalPie =
    useMemo(
      () => [
        {
          id: 0,
          value:
            Number(
              summary.functional ||
              0
            ),
          label: 'Functional',
        },
        {
          id: 1,
          value:
            Number(
              summary.nonFunctional ||
              0
            ),
          label: 'Non-Functional',
        },
      ],
      [
        summary.functional,
        summary.nonFunctional,
      ]
    )


  const supplyPie =
    useMemo(
      () => [
        {
          id: 0,
          value:
            Number(
              summary.waterSupplyYes ||
              0
            ),
          label:
            'Water Supplied',
        },
        {
          id: 1,
          value:
            Number(
              summary.waterSupplyNo ||
              0
            ),
          label:
            'Supply Disrupted',
        },
      ],
      [
        summary.waterSupplyYes,
        summary.waterSupplyNo,
      ]
    )


  const wardData =
    useMemo(
      () =>
        (
          dashboard
            ?.analytics
            ?.ward ||
          []
        )
          .filter(
            (item) =>
              item.name !==
              'Not Assigned'
          )
          .slice(
            0,
            12
          ),
      [
        dashboard,
      ]
    )


  const divisionData =
    useMemo(
      () =>
        dashboard
          ?.analytics
          ?.division ||
        [],
      [
        dashboard,
      ]
    )


  const zoneData =
    useMemo(
      () =>
        dashboard
          ?.analytics
          ?.zone ||
        [],
      [
        dashboard,
      ]
    )


  const trend =
    dashboard?.trend || []


  if (
    loading &&
    !dashboard
  ) {
    return (
      <Box
        sx={{
          minHeight: '65vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    )
  }


  return (
    <Box>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'stretch',
          md: 'center',
        }}
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#102A43',
              fontSize: {
                xs: 25,
                md: 30,
              },
            }}
          >
            Water Supply Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Daily operational monitoring and water supply analytics
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.25}
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
        >
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            sx={{
              minWidth: 165,
              bgcolor: '#FFFFFF',
            }}
          />

          <Button
            variant="outlined"
            startIcon={
              refreshing
                ? (
                    <CircularProgress
                      size={17}
                    />
                  )
                : (
                    <RefreshRoundedIcon />
                  )
            }
            disabled={refreshing}
            onClick={() =>
              loadDashboard({
                silent: true,
              })
            }
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={1}
        alignItems={{
          xs: 'flex-start',
          sm: 'center',
        }}
        sx={{
          mb: 2.5,
        }}
      >
        <Chip
          size="small"
          label={`Report date: ${selectedDate}`}
        />

        {lastUpdated && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Last refreshed:{' '}
            {lastUpdated.toLocaleTimeString(
              'en-IN',
              {
                hour:
                  '2-digit',
                minute:
                  '2-digit',
              }
            )}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Auto-refreshes every 60 seconds
        </Typography>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <MetricCard
          title="Total Schemes"
          value={
            formatNumber(
              summary.totalSchemes
            )
          }
          subtitle="Active schemes in master data"
          icon={
            <FactoryRoundedIcon />
          }
        />

        <MetricCard
          title="Submitted Today"
          value={
            formatNumber(
              summary.submittedToday
            )
          }
          subtitle={`${summary.reportingCoverage || 0}% reporting coverage`}
          icon={
            <AssignmentTurnedInRoundedIcon />
          }
        />

        <MetricCard
          title="Pending Reports"
          value={
            formatNumber(
              summary.pending
            )
          }
          subtitle="Yet to be submitted"
          icon={
            <PendingActionsRoundedIcon />
          }
        />

        <MetricCard
          title="Supply Disruption"
          value={`${summary.disruptionRate || 0}%`}
          subtitle={`${summary.waterSupplyNo || 0} reported supply disruptions`}
          icon={
            <PercentRoundedIcon />
          }
        />

        <MetricCard
          title="Functional"
          value={
            formatNumber(
              summary.functional
            )
          }
          subtitle="Operational schemes reported"
          icon={
            <CheckCircleRoundedIcon />
          }
        />

        <MetricCard
          title="Non-Functional"
          value={
            formatNumber(
              summary.nonFunctional
            )
          }
          subtitle="Requires monitoring/action"
          icon={
            <ReportProblemRoundedIcon />
          }
        />

        <MetricCard
          title="Water Supplied"
          value={
            formatNumber(
              summary.waterSupplyYes
            )
          }
          subtitle="Locations supplied today"
          icon={
            <WaterDropRoundedIcon />
          }
        />

        <MetricCard
          title="Water Production"
          value={
            formatNumber(
              summary.totalWaterProduction
            )
          }
          subtitle="Reported production total"
          icon={
            <WaterDropRoundedIcon />
          }
        />
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <SectionCard
          title="Plant Operational Status"
          subtitle="Functional vs non-functional submissions"
        >
          {(
            Number(
              summary.functional ||
              0
            ) +
            Number(
              summary.nonFunctional ||
              0
            )
          ) > 0 ? (
            <PieChart
              height={290}
              series={[
                {
                  data:
                    functionalPie,
                  innerRadius:
                    55,
                  outerRadius:
                    100,
                  paddingAngle:
                    2,
                  cornerRadius:
                    4,
                },
              ]}
            />
          ) : (
            <NoData />
          )}
        </SectionCard>

        <SectionCard
          title="Today's Water Supply"
          subtitle="Supply delivered vs disrupted"
        >
          {(
            Number(
              summary.waterSupplyYes ||
              0
            ) +
            Number(
              summary.waterSupplyNo ||
              0
            )
          ) > 0 ? (
            <PieChart
              height={290}
              series={[
                {
                  data:
                    supplyPie,
                  innerRadius:
                    55,
                  outerRadius:
                    100,
                  paddingAngle:
                    2,
                  cornerRadius:
                    4,
                },
              ]}
            />
          ) : (
            <NoData />
          )}
        </SectionCard>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.35fr) minmax(0, 0.65fr)',
          },
          gap: 2,
        }}
      >
        <SectionCard
          title="Ward-wise Supply Disruption"
          subtitle="Percentage of submitted ward reports with water supply marked No"
        >
          {wardData.length ? (
            <BarChart
              dataset={wardData}
              height={
                Math.max(
                  350,
                  wardData.length *
                    42
                )
              }
              layout="horizontal"
              yAxis={[
                {
                  scaleType:
                    'band',
                  dataKey:
                    'name',
                  width:
                    120,
                },
              ]}
              xAxis={[
                {
                  min:
                    0,
                  max:
                    100,
                  label:
                    'Disruption %',
                },
              ]}
              series={[
                {
                  dataKey:
                    'disruptionRate',
                  label:
                    'Disruption %',
                  valueFormatter:
                    (value) =>
                      `${value || 0}%`,
                },
              ]}
              margin={{
                left:
                  15,
                right:
                  25,
              }}
            />
          ) : (
            <NoData
              message="Ward information is not available for this date."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Reporting Overview"
          subtitle="Daily submission performance"
        >
          <Stack
            spacing={2}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Reporting Coverage
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.25,
                  fontWeight: 800,
                }}
              >
                {summary.reportingCoverage || 0}%
              </Typography>
            </Box>

            <Box
              sx={{
                height: 1,
                bgcolor: '#EDF2F7',
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Submitted
              </Typography>

              <Typography
                fontWeight={700}
              >
                {summary.submittedToday || 0}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Pending
              </Typography>

              <Typography
                fontWeight={700}
              >
                {summary.pending || 0}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Water Supply: Yes
              </Typography>

              <Typography
                fontWeight={700}
              >
                {summary.waterSupplyYes || 0}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Water Supply: No
              </Typography>

              <Typography
                fontWeight={700}
              >
                {summary.waterSupplyNo || 0}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Non-Functional
              </Typography>

              <Typography
                fontWeight={700}
              >
                {summary.nonFunctional || 0}
              </Typography>
            </Stack>
          </Stack>
        </SectionCard>
      </Box>

      <Box
        sx={{
          mt: 2,
        }}
      >
        <SectionCard
          title="7-Day Supply Disruption Trend"
          subtitle="Recent reporting, disruption and non-functional trend"
        >
          {trend.some(
            (item) =>
              Number(
                item.submitted ||
                0
              ) > 0
          ) ? (
            <LineChart
              height={340}
              xAxis={[
                {
                  scaleType:
                    'point',
                  data:
                    trend.map(
                      (item) =>
                        item.date
                          ?.slice(5)
                    ),
                  label:
                    'Date',
                },
              ]}
              yAxis={[
                {
                  min:
                    0,
                },
              ]}
              series={[
                {
                  data:
                    trend.map(
                      (item) =>
                        item.disruptionRate ||
                        0
                    ),
                  label:
                    'Disruption %',
                  valueFormatter:
                    (value) =>
                      `${value || 0}%`,
                },
                {
                  data:
                    trend.map(
                      (item) =>
                        item.nonFunctional ||
                        0
                    ),
                  label:
                    'Non-Functional',
                },
              ]}
            />
          ) : (
            <NoData
              message="No submissions are available in the recent seven-day window."
            />
          )}
        </SectionCard>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        <SectionCard
          title="Division-wise Performance"
          subtitle="Water supply disruption by division"
        >
          {divisionData.length ? (
            <BarChart
              dataset={
                divisionData
              }
              height={320}
              xAxis={[
                {
                  scaleType:
                    'band',
                  dataKey:
                    'name',
                },
              ]}
              yAxis={[
                {
                  min:
                    0,
                  max:
                    100,
                  label:
                    'Disruption %',
                },
              ]}
              series={[
                {
                  dataKey:
                    'disruptionRate',
                  label:
                    'Disruption %',
                  valueFormatter:
                    (value) =>
                      `${value || 0}%`,
                },
              ]}
            />
          ) : (
            <NoData
              message="Division information is not available."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Zone-wise Performance"
          subtitle="Water supply disruption by zone"
        >
          {zoneData.length ? (
            <BarChart
              dataset={
                zoneData
              }
              height={320}
              xAxis={[
                {
                  scaleType:
                    'band',
                  dataKey:
                    'name',
                },
              ]}
              yAxis={[
                {
                  min:
                    0,
                  max:
                    100,
                  label:
                    'Disruption %',
                },
              ]}
              series={[
                {
                  dataKey:
                    'disruptionRate',
                  label:
                    'Disruption %',
                  valueFormatter:
                    (value) =>
                      `${value || 0}%`,
                },
              ]}
            />
          ) : (
            <NoData
              message="Zone information is not available."
            />
          )}
        </SectionCard>
      </Box>
    </Box>
  )
}

export default Dashboard
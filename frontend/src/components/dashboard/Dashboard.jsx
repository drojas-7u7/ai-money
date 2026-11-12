import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './Dashboard.module.css'

const CHART_COLORS = {
  fixed:    '#1B3B5A',
  variable: '#F59E0B',
  available:'#10B981',
  negative: '#EF4444',
}

function buildChartData(data) {
  if (!data?.breakdown) return []
  const { fixed, variable } = data.breakdown
  const available = data.available
  if (available >= 0) {
    return [
      { name: 'Gastos fijos',     value: fixed,     color: CHART_COLORS.fixed },
      { name: 'Gastos variables', value: variable,  color: CHART_COLORS.variable },
      { name: 'Disponible',       value: available, color: CHART_COLORS.available },
    ]
  }
  // gastos superan ingresos: solo mostramos el desglose de gasto real
  return [
    { name: 'Gastos fijos',     value: fixed,    color: CHART_COLORS.fixed },
    { name: 'Gastos variables', value: variable, color: CHART_COLORS.negative },
  ]
}

function CustomTooltip({ active, payload, income }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  const pct = income > 0 ? ((value / income) * 100).toFixed(1) : 0
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipName}>{name}</span>
      <span className={styles.tooltipValue}>
        {value.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € · {pct} %
      </span>
    </div>
  )
}

function MetricCard({ label, value, sub, variant }) {
  return (
    <div className={`${styles.metricCard} ${variant ? styles[variant] : ''}`}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
      {sub && <span className={styles.metricSub}>{sub}</span>}
    </div>
  )
}

function SkeletonCard() {
  return <div className={styles.skeletonCard} />
}

function Dashboard({ data = null, onAction, isLoading = false, error = null, profileName = null }) {
  if (!profileName && !isLoading) {
    return (
      <div className={styles.emptyState}>
        <Target size={40} className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>Selecciona un perfil para ver tu resumen</p>
        <p className={styles.emptySub}>Ve a la pestaña Perfil y elige uno de los 4 perfiles de demo.</p>
      </div>
    )
  }

  const available    = data?.available ?? 0
  const isPositive   = available >= 0
  const savingsRate  = data?.savings_rate ?? 0
  const isRatePos    = savingsRate >= 0
  const chartData    = buildChartData(data)

  return (
    <div className={styles.container}>

      {profileName && (
        <div className={styles.header}>
          <h2 className={styles.greeting}>Resumen de {profileName}</h2>
          {data?.goals?.length > 0 && (
            <div className={styles.goalPill}>
              <Target size={13} />
              <span>{data.goals[0]}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className={styles.metricsRow}>
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <MetricCard
              label="Ingresos"
              value={`${(data?.income ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`}
              sub="neto / mes"
            />
            <MetricCard
              label="Gastos"
              value={`${(data?.expenses ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`}
              sub="fijos + variables"
            />
            <MetricCard
              label="Disponible"
              value={
                <span className={styles.availableValue}>
                  {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  {isPositive ? '+' : ''}
                  {available.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              }
              sub="este mes"
              variant={isPositive ? 'cardPositive' : 'cardNegative'}
            />
          </>
        )}
      </div>

      {/* Gráfica + leyenda */}
      {!isLoading && chartData.length > 0 && (
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Distribución de ingresos</h3>
          <div className={styles.chartBody}>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip income={data?.income ?? 1} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.chartCenter}>
                <span className={styles.chartCenterLabel}>Ingresos</span>
                <span className={styles.chartCenterValue}>
                  {(data?.income ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
                </span>
              </div>
            </div>

            <ul className={styles.legend}>
              {chartData.map((entry) => {
                const pct = data?.income > 0
                  ? ((entry.value / data.income) * 100).toFixed(1)
                  : 0
                return (
                  <li key={entry.name} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: entry.color }} />
                    <div className={styles.legendText}>
                      <span className={styles.legendName}>{entry.name}</span>
                      <span className={styles.legendAmount}>
                        {entry.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        <span className={styles.legendPct}> · {pct} %</span>
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Tasa de ahorro */}
      <div className={styles.savingsSection}>
        <div className={styles.savingsHeader}>
          <span className={styles.savingsLabel}>Tasa de ahorro potencial</span>
          {isLoading
            ? <div className={styles.skeletonText} />
            : <span className={`${styles.savingsRate} ${isRatePos ? styles.ratePositive : styles.rateNegative}`}>
                {isRatePos ? '+' : ''}{savingsRate.toFixed(1)} %
              </span>
          }
        </div>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isRatePos ? styles.fillPositive : styles.fillNegative}`}
            style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
          />
        </div>
        {!isRatePos && !isLoading && (
          <p className={styles.rateWarning}>
            <AlertTriangle size={13} /> Los gastos superan los ingresos este mes.
          </p>
        )}
      </div>

      {/* Objetivos */}
      {data?.goals?.length > 0 && !isLoading && (
        <div className={styles.goalsSection}>
          <h3 className={styles.goalsTitle}>Objetivos</h3>
          <ul className={styles.goalsList}>
            {data.goals.map((goal) => (
              <li key={goal} className={styles.goalItem}>
                <Target size={14} className={styles.goalDot} />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}

export default Dashboard

import { useEffect, useRef, useState } from 'react'
import { BarChart2, PiggyBank, CreditCard, FileText, MessageSquare, ArrowRight, ShieldCheck, Sparkles, TrendingUp, TrendingDown, Target } from 'lucide-react'
import logo from '../../assets/logo.png'
import styles from './Landing.module.css'

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

const PROFILES = [
  { id: 'demo_01', alias: 'Alex',  img: '/alex.png',  income: 1592,    available: 472,    goal: 'Fondo de emergencia' },
  { id: 'demo_02', alias: 'Noa',   img: '/noa.png',   income: 915,     available: 95,     goal: 'Curso de formación' },
  { id: 'demo_03', alias: 'Sam',   img: '/sam.png',   income: 3019.80, available: 819.80, goal: 'Entrada de vivienda' },
  { id: 'demo_04', alias: 'Dani',  img: '/dani.png',  income: 1860,    available: -90,    goal: 'Reducir gastos y crear colchón' },
]

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Dashboard financiero',
    description: 'Visualiza tus ingresos, gastos y dinero disponible de un vistazo con un gráfico interactivo.',
  },
  {
    icon: PiggyBank,
    title: 'Simulador de ahorro',
    description: 'Calcula cuánto necesitas ahorrar cada mes para alcanzar tu objetivo en el plazo que elijas.',
  },
  {
    icon: CreditCard,
    title: 'Simulador de préstamo',
    description: 'Conoce tu cuota mensual, el total a pagar y el nivel de riesgo antes de pedir un crédito.',
  },
  {
    icon: FileText,
    title: 'Analizador de nómina',
    description: 'Sube tu nómina en PDF y entiende cada deducción: IRPF, Seguridad Social y más.',
  },
  {
    icon: MessageSquare,
    title: 'Chat con IA',
    description: 'Pregunta lo que quieras sobre tus finanzas y recibe explicaciones claras adaptadas a tu situación.',
  },
]

function Landing({ onEnterDemo }) {
  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <img src={logo} alt="AI Money" className={styles.navLogo} />
          <span className={styles.navName}>AI Money</span>
        </div>
        <button className={styles.demoButton} onClick={onEnterDemo}>
          Ver la demo <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero — título + CTA */}
      <section className={styles.hero}>
        <div className={styles.heroBlobA} />
        <div className={styles.heroBlobB} />
        <span className={styles.badge}>
          <ShieldCheck size={13} /> Plataforma educativa · Datos ficticios
        </span>
        <h1 className={styles.heroTitle}>
          Entiende tu dinero.<br />
          <span>Decide con confianza.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Tus finanzas no tienen por qué ser complicadas.
        </p>
        <button className={styles.heroCta} onClick={onEnterDemo}>
          Empieza a explorar <ArrowRight size={18} />
        </button>
      </section>

      {/* Sobre la app */}
      <section className={styles.about}>
        <Reveal>
          <div className={styles.aboutInner}>
            <div className={styles.aboutIconWrap}>
              <Sparkles size={28} />
            </div>
            <div className={styles.aboutText}>
              <p>
                AI Money es tu asistente de educación financiera con inteligencia artificial.
                Te ayuda a comprender tus ingresos y gastos, interpretar tu nómina y descubrir
                cómo tus decisiones de ahorro o financiación pueden afectar a tu economía.
              </p>
              <p>
                Todo con explicaciones claras, ejemplos adaptados a tu situación y herramientas
                sencillas para que puedas aprender a gestionar mejor tu dinero.
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <blockquote className={styles.quote}>
            Porque tomar buenas decisiones empieza por entender tus opciones.
          </blockquote>
        </Reveal>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <Reveal>
          <div className={styles.featuresHeader}>
            <span className={styles.featuresEyebrow}>Herramientas</span>
            <h2 className={styles.featuresTitle}>¿Qué puedes hacer?</h2>
          </div>
        </Reveal>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Demo profiles */}
      <section className={styles.demo}>
        <Reveal>
          <div className={styles.demoHeader}>
            <span className={styles.featuresEyebrow}>Demo interactiva</span>
            <h2 className={styles.featuresTitle}>Elige un perfil y empieza</h2>
            <p className={styles.demoSubtitle}>
              La demo incluye cuatro perfiles ficticios con situaciones financieras distintas.
              Cada uno tiene sus propios ingresos, gastos y objetivos para que puedas explorar
              diferentes escenarios reales.
            </p>
          </div>
        </Reveal>
        <div className={styles.profilesGrid}>
          {PROFILES.map((p, i) => {
            const positive = p.available >= 0
            return (
              <Reveal key={p.id} delay={i * 0.1}>
                <div className={styles.profileCard}>
                  <img src={p.img} alt={p.alias} className={styles.profileImg} />
                  <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{p.alias}</span>
                    <span className={styles.profileIncome}>
                      {p.income.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € / mes
                    </span>
                    <span className={`${styles.profileAvailable} ${positive ? styles.positive : styles.negative}`}>
                      {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {positive ? '+' : ''}{p.available.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </span>
                    <span className={styles.profileGoal}>
                      <Target size={12} /> {p.goal}
                    </span>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
        <Reveal delay={0.2}>
          <button className={styles.heroCta} onClick={onEnterDemo}>
            Explorar la demo <ArrowRight size={18} />
          </button>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>AI Money · Reto Ebury × Somos F5 · Demo educativa, sin datos reales</p>
      </footer>

    </div>
  )
}

export default Landing

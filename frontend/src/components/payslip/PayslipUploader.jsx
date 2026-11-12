import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, FileText, ArrowRight, Info, AlertTriangle } from 'lucide-react'
import styles from './PayslipUploader.module.css'

const MAX_SIZE_BYTES = 2 * 1024 * 1024

function PayslipUploader({ result = null, onUpload, onReset, isLoading = false, error = null }) {
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (result) setShowResult(true)
  }, [result])

  const validateAndUpload = (file) => {
    setLocalError(null)
    if (!file) return
    if (file.type !== 'application/pdf') {
      setLocalError('Solo se aceptan archivos PDF.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('El archivo supera el límite de 2 MB.')
      return
    }
    setFileName(file.name)
    onUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    validateAndUpload(e.dataTransfer.files[0])
  }

  const handleInputChange = (e) => {
    validateAndUpload(e.target.files[0])
  }

  const handleReset = () => {
    setShowResult(false)
    setFileName(null)
    setLocalError(null)
    if (inputRef.current) inputRef.current.value = ''
    onReset()
  }

  const displayError = localError || error
  const totalDeductions = result?.deductions.reduce((sum, d) => sum + d.amount, 0) ?? 0

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Analizador de nómina</h2>

      <div className={styles.demoNotice}>
        <AlertTriangle size={15} />
        <span>Usa solo las nóminas ficticias de demo. No subas documentos reales.</span>
      </div>

      {!showResult && (
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dragActive : ''} ${isLoading ? styles.loadingZone : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isLoading && inputRef.current?.click()}
          role="button"
          aria-label="Área de subida de nómina en PDF"
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className={styles.hiddenInput}
            onChange={handleInputChange}
          />
          {isLoading
            ? <Loader2 size={48} className={styles.uploadIconSpin} />
            : <Upload size={48} className={styles.uploadIcon} />
          }
          <p className={styles.dropLabel}>
            {isLoading ? 'Analizando tu nómina...' : 'Haz clic o arrastra aquí tu nómina'}
          </p>
          <p className={styles.dropHint}>Solo PDF · Máximo 2 MB</p>
          {fileName && !isLoading && (
            <p className={styles.fileName}>
              <FileText size={13} /> {fileName}
            </p>
          )}
          {isLoading && <div className={styles.progressBar}><div className={styles.progressFill} /></div>}
        </div>
      )}

      {displayError && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} /> {displayError}
        </div>
      )}

      {result && showResult && (
        <div className={styles.results}>

          <div className={styles.resultNotice}>
            <Info size={15} /> {result.warning}
          </div>

          {/* Bruto → Neto */}
          <div className={styles.grossNetRow}>
            <div className={styles.grossCard}>
              <span className={styles.amountLabel}>Salario bruto</span>
              <span className={styles.amountValue}>
                {result.gross.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
            <ArrowRight size={24} className={styles.arrowSeparator} />
            <div className={styles.netCard}>
              <span className={styles.amountLabel}>Salario neto</span>
              <span className={`${styles.amountValue} ${styles.netValue}`}>
                {result.net.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          {/* Tabla de deducciones */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Deducciones</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Concepto</th>
                  <th className={`${styles.th} ${styles.thRight}`}>Importe</th>
                </tr>
              </thead>
              <tbody>
                {result.deductions.map((d) => (
                  <tr key={d.code} className={styles.tableRow}>
                    <td className={styles.td}>{d.label}</td>
                    <td className={`${styles.td} ${styles.tdAmount}`}>
                      -{d.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalRow}>
                  <td className={styles.td}>Total deducciones</td>
                  <td className={`${styles.td} ${styles.tdAmount} ${styles.tdTotal}`}>
                    -{totalDeductions.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conceptos con explicación */}
          {result.concepts?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>¿Qué significa cada concepto?</h3>
              <div className={styles.conceptsGrid}>
                {result.concepts.map((c) => (
                  <div key={c.code} className={styles.conceptCard}>
                    <span className={styles.conceptLabel}>{c.label}</span>
                    <p className={styles.conceptExplanation}>{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className={styles.resetButton} onClick={handleReset}>
            Analizar otra nómina
          </button>
        </div>
      )}
    </div>
  )
}

export default PayslipUploader

# Contenido de nóminas y conexión segura con el LLM

## Flujo mínimo
1. El frontend envía al backend solo la pregunta, histórico corto y contexto numérico reducido.
2. Si se procesa PDF, el Dev 4 extrae texto **en backend** y aplica una lista restrictiva: reconocer solo etiquetas numéricas y conceptos de prueba; no compartir PDF completo con el proveedor LLM.
3. `payslip_glossary.json` es el vocabulario aprobado; se inyectan solo 2–4 entradas relevantes al prompt y un ejemplo numérico ficticio.
4. El Dev 5 obliga al modelo a responder en español claro, **explicar + ejemplo + una pregunta breve de comprobación**, sin inventar condiciones personales, nóminas o tipos de IRPF.
5. La explicación que devuelva IA no sustituye el resultado determinista de `finance.py` ni de `payslip.py`.

## Prompt base sugerido
Eres un educador financiero en español. Usa solo los datos agregados y ficticios suministrados. Da respuestas breves y claras, diferencia bruto y neto, explica las deducciones con ejemplos y termina con una pregunta de comprensión. No calcules impuestos personalizados ni apruebes créditos. Si falta un dato, dilo. Nunca solicites nombre, DNI, NSS, dirección, IBAN o nóminas reales. Las simulaciones no constituyen asesoramiento financiero, fiscal o laboral.

## Preguntas de demostración
- «Mi nómina pone 2000 € brutos y 1592 € netos: ¿dónde se va la diferencia?»
- «Si tengo 400 € disponibles, ¿puedo ahorrar 100 € al mes?»
- «¿Qué diferencia hay entre el TIN y la TAE?»
- «¿Por qué un préstamo sin interés de 1200 € a 12 meses son 100 € al mes?»

## Privacidad imprescindible
Solo archivos sintéticos para demo; tamaño limitado; no guardar uploads; no escribir texto de PDF en logs; borrar cualquier temporal al terminar el request; excluir `uploads/**` de Git; dejar claro en UI 'Demo educativa. No introduzcas datos reales'. Sustituir un nombre por una etiqueta no convierte datos ligados a un perfil en datos anónimos.

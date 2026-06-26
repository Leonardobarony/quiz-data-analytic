import { detectStartingLevel, scoreToolFilter } from '../lib/levelDetection'
import type { ToolSelection } from '../lib/types'

const makeSelection = (
  groupId: string,
  tools: string[],
  confidence: ToolSelection['confidence']
): ToolSelection => ({ groupId, selectedTools: tools, confidence })

describe('detectStartingLevel', () => {
  it('deve retornar junior para seleções básicas sem Spark', () => {
    const selections: ToolSelection[] = [
      makeSelection('orquestracao', ['Azure Data Factory'], 'basico'),
      makeSelection('sql_banco', ['Azure SQL'], 'basico'),
    ]
    expect(detectStartingLevel(selections)).toBe('junior')
  })

  it('deve retornar pleno para Spark + Pipelines', () => {
    const selections: ToolSelection[] = [
      makeSelection('processamento', ['PySpark', 'Spark SQL'], 'intermediario'),
      makeSelection('orquestracao', ['Azure Data Factory', 'Apache Airflow'], 'intermediario'),
    ]
    expect(detectStartingLevel(selections)).toBe('pleno')
  })

  it('deve retornar senior para Spark + Pipelines + CI/CD', () => {
    const selections: ToolSelection[] = [
      makeSelection('processamento', ['PySpark', 'Databricks Notebooks'], 'intermediario'),
      makeSelection('orquestracao', ['Apache Airflow', 'dbt'], 'intermediario'),
      makeSelection('cicd', ['GitHub', 'Azure DevOps'], 'intermediario'),
    ]
    expect(detectStartingLevel(selections)).toBe('senior')
  })

  it('deve retornar especialista para domínio avançado em todas as áreas', () => {
    const selections: ToolSelection[] = [
      makeSelection('processamento', ['PySpark', 'Spark SQL', 'Databricks Notebooks'], 'avancado'),
      makeSelection('orquestracao', ['Apache Airflow', 'dbt', 'Azure Data Factory'], 'avancado'),
      makeSelection('cicd', ['GitHub', 'Terraform', 'Azure DevOps'], 'avancado'),
      makeSelection('governanca', ['Microsoft Purview', 'Unity Catalog'], 'intermediario'),
    ]
    expect(detectStartingLevel(selections)).toBe('especialista')
  })

  it('deve retornar junior para seleções vazias', () => {
    expect(detectStartingLevel([])).toBe('junior')
  })
})

describe('scoreToolFilter', () => {
  it('deve retornar 0 para seleções vazias', () => {
    expect(scoreToolFilter([])).toBe(0)
  })

  it('deve retornar valor entre 0 e 10', () => {
    const selections: ToolSelection[] = [
      makeSelection('orquestracao', ['Apache Airflow'], 'avancado'),
      makeSelection('processamento', ['PySpark'], 'avancado'),
      makeSelection('armazenamento', ['Delta Lake'], 'avancado'),
      makeSelection('sql_banco', ['BigQuery'], 'avancado'),
      makeSelection('modelagem_bi', ['Power BI'], 'avancado'),
      makeSelection('power_platform', ['Power Apps'], 'avancado'),
      makeSelection('governanca', ['Microsoft Purview'], 'avancado'),
      makeSelection('cicd', ['GitHub'], 'avancado'),
    ]
    const score = scoreToolFilter(selections)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(10)
  })

  it('deve pontuar mais para confiança avancado que basico', () => {
    const basico: ToolSelection[] = [
      makeSelection('orquestracao', ['Apache Airflow'], 'basico'),
    ]
    const avancado: ToolSelection[] = [
      makeSelection('orquestracao', ['Apache Airflow'], 'avancado'),
    ]
    expect(scoreToolFilter(avancado)).toBeGreaterThan(scoreToolFilter(basico))
  })

  it('não deve pontuar grupos sem ferramentas selecionadas', () => {
    const withTools: ToolSelection[] = [
      makeSelection('orquestracao', ['Apache Airflow'], 'avancado'),
    ]
    const noTools: ToolSelection[] = [
      makeSelection('orquestracao', [], 'avancado'),
    ]
    expect(scoreToolFilter(withTools)).toBeGreaterThan(scoreToolFilter(noTools))
  })
})

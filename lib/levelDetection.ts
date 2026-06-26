import type { Level, ToolSelection } from './types'

// IDs dos grupos de ferramentas conforme tools.json
const GROUP_ORQUESTRACAO = 'orquestracao'   // Fabric Pipelines, ADF, Airflow, dbt, Glue
const GROUP_PROCESSAMENTO = 'processamento' // PySpark, Spark SQL, Databricks, Fabric Notebooks, Pandas
const GROUP_ARMAZENAMENTO = 'armazenamento' // Delta Lake, Parquet, Iceberg, Hudi, OneLake, ADLS, S3
const GROUP_SQL_BANCO = 'sql_banco'         // Azure SQL, Synapse, BigQuery, Snowflake, Redshift, DuckDB
const GROUP_MODELAGEM_BI = 'modelagem_bi'   // Power BI, Tableau, Looker, Tabular Editor, DAX Studio
const GROUP_POWER_PLATFORM = 'power_platform' // Power Apps, Power Automate, Dataverse
const GROUP_GOVERNANCA = 'governanca'       // Microsoft Purview, Unity Catalog, Alation, Collibra
const GROUP_CICD = 'cicd'                   // GitHub, Azure DevOps, GitLab, Terraform

// Ferramentas-chave para detecção de nível
const SPARK_TOOLS = ['PySpark', 'Spark SQL', 'Databricks Notebooks', 'Fabric Notebooks']
const PIPELINE_TOOLS = ['Fabric Pipelines', 'Azure Data Factory', 'Apache Airflow', 'dbt', 'Glue']
const CICD_TOOLS = ['GitHub', 'Azure DevOps', 'GitLab', 'Terraform']
const GOVERNANCE_TOOLS = ['Microsoft Purview', 'Unity Catalog', 'Alation', 'Collibra']

function hasToolsFrom(selection: ToolSelection, tools: string[]): boolean {
  return selection.selectedTools.some(t => tools.includes(t))
}

function getGroupSelection(selections: ToolSelection[], groupId: string): ToolSelection | undefined {
  return selections.find(s => s.groupId === groupId)
}

function getConfidenceLevel(selection: ToolSelection | undefined): number {
  if (!selection) return 0
  switch (selection.confidence) {
    case 'avancado': return 3
    case 'intermediario': return 2
    case 'basico': return 1
    default: return 0
  }
}

/**
 * Detecta o nível de partida com base nas seleções de ferramentas.
 *
 * Regras do PRD §3:
 * - Básico (Pipelines+SQL) → Júnior
 * - Intermediário (Pipelines+Spark) → Pleno
 * - Intermediário/Avançado (Spark+CI/CD+Governance) → Sênior
 * - Avançado em tudo + Governance → Especialista
 */
export function detectStartingLevel(selections: ToolSelection[]): Level {
  const processamento = getGroupSelection(selections, GROUP_PROCESSAMENTO)
  const orquestracao = getGroupSelection(selections, GROUP_ORQUESTRACAO)
  const cicd = getGroupSelection(selections, GROUP_CICD)
  const governanca = getGroupSelection(selections, GROUP_GOVERNANCA)

  const hasSparkTools = processamento
    ? hasToolsFrom(processamento, SPARK_TOOLS)
    : false
  const hasPipelineTools = orquestracao
    ? hasToolsFrom(orquestracao, PIPELINE_TOOLS)
    : false
  const hasCICDTools = cicd ? hasToolsFrom(cicd, CICD_TOOLS) : false
  const hasGovernanceTools = governanca ? hasToolsFrom(governanca, GOVERNANCE_TOOLS) : false

  const processamentoLevel = getConfidenceLevel(processamento)
  const orquestracaoLevel = getConfidenceLevel(orquestracao)
  const cicdLevel = getConfidenceLevel(cicd)
  const governancaLevel = getConfidenceLevel(governanca)

  // Especialista: domina Spark + CI/CD + Governance em nível avançado
  if (
    hasSparkTools && processamentoLevel >= 3 &&
    hasPipelineTools && orquestracaoLevel >= 3 &&
    hasCICDTools && cicdLevel >= 2 &&
    hasGovernanceTools && governancaLevel >= 2
  ) {
    return 'especialista'
  }

  // Sênior: usa Spark + CI/CD + Governance em nível intermediário ou superior
  if (
    hasSparkTools && processamentoLevel >= 2 &&
    hasPipelineTools && orquestracaoLevel >= 2 &&
    (hasCICDTools || hasGovernanceTools)
  ) {
    return 'senior'
  }

  // Pleno: usa Spark e pipelines em nível ao menos básico
  if (hasSparkTools && hasPipelineTools) {
    return 'pleno'
  }

  // Júnior: padrão para quem usa ferramentas básicas de pipeline e SQL
  return 'junior'
}

/**
 * Calcula o score do filtro de ferramentas (0–10).
 * Cada grupo selecionado com confiança ≥ básico vale até 1.25 pontos (8 grupos = 10 max).
 */
export function scoreToolFilter(selections: ToolSelection[]): number {
  const GROUPS = [
    GROUP_ORQUESTRACAO, GROUP_PROCESSAMENTO, GROUP_ARMAZENAMENTO,
    GROUP_SQL_BANCO, GROUP_MODELAGEM_BI, GROUP_POWER_PLATFORM,
    GROUP_GOVERNANCA, GROUP_CICD
  ]

  let total = 0
  for (const groupId of GROUPS) {
    const sel = getGroupSelection(selections, groupId)
    if (!sel || sel.selectedTools.length === 0 || !sel.confidence) continue
    const conf = getConfidenceLevel(sel)
    // Básico = 0.5, Intermediário = 0.875, Avançado = 1.25
    total += (conf / 3) * 1.25
  }

  return Math.min(10, Math.round(total * 10) / 10)
}

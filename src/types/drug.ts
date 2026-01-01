// 薬剤データの型定義

export type CalcType = 
  | 'MG_PER_KG_PER_DAY'     // mg/kg/day から 1日量を算出
  | 'MG_PER_KG_PER_DOSE'    // mg/kg/dose から 1回量を算出
  | 'FIXED_DAILY_MG'        // 固定1日量
  | 'FIXED_DOSE_MG';        // 固定1回量

export interface DrugRule {
  rule_id: string;
  age_min_months: number;
  age_max_months: number;
  wt_min_kg: number;
  wt_max_kg: number;
  calc_type: CalcType;
  base_value: number;
  base_unit: string;
  max_daily_mg?: number;
  max_single_mg?: number;
  rounding: string;
  note: string;
  source_title: string;
  source_version: string;
  source_ref: string;
  range_min?: number;
  range_max?: number;
}

export interface DrugInfo {
  id: string;
  name: string;
  genericName: string;
  defaultConcentration?: number; // mg/mL
  unit: 'mg' | 'mL';
  rules: DrugRule[];
}

export interface PatientInfo {
  ageYears: number;
  ageMonths: number;
  weightKg: number;
}

export interface PrescriptionInfo {
  singleDose: number;
  dailyFrequency: number;
  unit: 'mg' | 'mL';
  concentration?: number; // mg/mL (mL入力時に必要)
}

export interface CalculationStep {
  label: string;
  expr: string;
  value: string;
}

export type JudgmentStatus = 'ok' | 'warning' | 'danger';

export interface CalculationResult {
  status: JudgmentStatus;
  statusLabel: string;
  appliedRule: DrugRule | null;
  rangePolicy: 'EXPLICIT' | 'PERCENT_AROUND_BASE';
  rangePercent: number;
  baseDailyDose: number;
  baseSingleDose: number;
  recommendedMin: number;
  recommendedMax: number;
  prescribedSingleDose: number;
  prescribedDailyDose: number;
  steps: CalculationStep[];
  warnings: string[];
}

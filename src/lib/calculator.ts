import {
  DrugInfo,
  DrugRule,
  PatientInfo,
  PrescriptionInfo,
  CalculationResult,
  CalculationStep,
  JudgmentStatus,
} from '@/types/drug';

// 年齢を月齢に変換
export const ageToMonths = (years: number, months: number): number => {
  return years * 12 + months;
};

// 適用可能なルールを探す
export const findApplicableRule = (
  drug: DrugInfo,
  patient: PatientInfo,
  ruleIndex: number = 0
): DrugRule | null => {
  const ageMonths = ageToMonths(patient.ageYears, patient.ageMonths);
  
  const applicableRules = drug.rules.filter(
    rule =>
      ageMonths >= rule.age_min_months &&
      ageMonths <= rule.age_max_months &&
      patient.weightKg >= rule.wt_min_kg &&
      patient.weightKg <= rule.wt_max_kg
  );

  return applicableRules[ruleIndex] || applicableRules[0] || null;
};

// 数値を指定精度で丸める
export const roundValue = (value: number, precision: number = 1): number => {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
};

// 用量計算のメインロジック
export const calculateDosage = (
  drug: DrugInfo,
  patient: PatientInfo,
  prescription: PrescriptionInfo,
  rangePercent: number = 20,
  ruleIndex: number = 0
): CalculationResult => {
  const steps: CalculationStep[] = [];
  const warnings: string[] = [];

  // 月齢計算
  const ageMonths = ageToMonths(patient.ageYears, patient.ageMonths);
  steps.push({
    label: '月齢',
    expr: `${patient.ageYears}歳 ${patient.ageMonths}か月`,
    value: `${ageMonths} か月`,
  });

  // 体重
  steps.push({
    label: '体重',
    expr: 'wt',
    value: `${patient.weightKg} kg`,
  });

  // ルール適用
  const rule = findApplicableRule(drug, patient, ruleIndex);
  
  if (!rule) {
    return {
      status: 'danger',
      statusLabel: '該当ルールなし',
      appliedRule: null,
      rangePolicy: 'PERCENT_AROUND_BASE',
      rangePercent,
      baseDailyDose: 0,
      baseSingleDose: 0,
      recommendedMin: 0,
      recommendedMax: 0,
      prescribedSingleDose: 0,
      prescribedDailyDose: 0,
      steps,
      warnings: ['この患者条件に該当する用量ルールが見つかりません'],
    };
  }

  steps.push({
    label: '適用ルール',
    expr: rule.rule_id,
    value: rule.note,
  });

  // 処方入力の有無を判定（mL入力時は濃度必須）
  const hasPrescriptionInput =
    prescription.unit === 'mL'
      ? prescription.singleDose > 0 && !!prescription.concentration && prescription.concentration > 0
      : prescription.singleDose > 0;

  // 処方量をmgに正規化（入力がある場合のみ）
  let prescribedSingleDoseMg = 0;
  let prescribedDailyDoseMg = 0;

  if (hasPrescriptionInput) {
    prescribedSingleDoseMg = prescription.singleDose;
    if (prescription.unit === 'mL' && prescription.concentration) {
      prescribedSingleDoseMg = prescription.singleDose * prescription.concentration;
      steps.push({
        label: '処方量(mg換算)',
        expr: `${prescription.singleDose} mL × ${prescription.concentration} mg/mL`,
        value: `${roundValue(prescribedSingleDoseMg)} mg/回`,
      });
    } else {
      steps.push({
        label: '処方量',
        expr: '',
        value: `${prescribedSingleDoseMg} mg/回`,
      });
    }

    prescribedDailyDoseMg = prescribedSingleDoseMg * prescription.dailyFrequency;
    steps.push({
      label: '処方1日量',
      expr: `${roundValue(prescribedSingleDoseMg)} × ${prescription.dailyFrequency}回`,
      value: `${roundValue(prescribedDailyDoseMg)} mg/day`,
    });
  }

  // 基準値計算
  let baseDailyDose: number;
  let baseSingleDose: number;

  switch (rule.calc_type) {
    case 'MG_PER_KG_PER_DAY':
      baseDailyDose = patient.weightKg * rule.base_value;
      baseSingleDose = baseDailyDose / prescription.dailyFrequency;
      steps.push({
        label: '基準用量',
        expr: rule.base_unit,
        value: `${rule.base_value}`,
      });
      steps.push({
        label: '基準1日量',
        expr: `${patient.weightKg} kg × ${rule.base_value}`,
        value: `${roundValue(baseDailyDose)} mg/day`,
      });
      steps.push({
        label: '基準1回量',
        expr: `${roundValue(baseDailyDose)} ÷ ${prescription.dailyFrequency}`,
        value: `${roundValue(baseSingleDose)} mg/回`,
      });
      break;

    case 'MG_PER_KG_PER_DOSE':
      baseSingleDose = patient.weightKg * rule.base_value;
      baseDailyDose = baseSingleDose * prescription.dailyFrequency;
      steps.push({
        label: '基準用量',
        expr: rule.base_unit,
        value: `${rule.base_value}`,
      });
      steps.push({
        label: '基準1回量',
        expr: `${patient.weightKg} kg × ${rule.base_value}`,
        value: `${roundValue(baseSingleDose)} mg/回`,
      });
      steps.push({
        label: '基準1日量',
        expr: `${roundValue(baseSingleDose)} × ${prescription.dailyFrequency}`,
        value: `${roundValue(baseDailyDose)} mg/day`,
      });
      break;

    case 'FIXED_DAILY_MG':
      baseDailyDose = rule.base_value;
      baseSingleDose = baseDailyDose / prescription.dailyFrequency;
      steps.push({
        label: '固定1日量',
        expr: '',
        value: `${baseDailyDose} mg/day`,
      });
      steps.push({
        label: '基準1回量',
        expr: `${baseDailyDose} ÷ ${prescription.dailyFrequency}`,
        value: `${roundValue(baseSingleDose)} mg/回`,
      });
      break;

    case 'FIXED_DOSE_MG':
      baseSingleDose = rule.base_value;
      baseDailyDose = baseSingleDose * prescription.dailyFrequency;
      steps.push({
        label: '固定1回量',
        expr: '',
        value: `${baseSingleDose} mg/回`,
      });
      steps.push({
        label: '基準1日量',
        expr: `${baseSingleDose} × ${prescription.dailyFrequency}`,
        value: `${roundValue(baseDailyDose)} mg/day`,
      });
      break;

    default:
      baseDailyDose = 0;
      baseSingleDose = 0;
  }

  // 推奨レンジ計算
  let recommendedMin: number;
  let recommendedMax: number;
  let rangePolicy: 'EXPLICIT' | 'PERCENT_AROUND_BASE';

  if (rule.range_min !== undefined && rule.range_max !== undefined) {
    // CSVに明示レンジがある場合
    rangePolicy = 'EXPLICIT';
    if (rule.calc_type === 'MG_PER_KG_PER_DOSE') {
      recommendedMin = patient.weightKg * rule.range_min;
      recommendedMax = patient.weightKg * rule.range_max;
    } else if (rule.calc_type === 'MG_PER_KG_PER_DAY') {
      const minDaily = patient.weightKg * rule.range_min;
      const maxDaily = patient.weightKg * rule.range_max;
      recommendedMin = minDaily / prescription.dailyFrequency;
      recommendedMax = maxDaily / prescription.dailyFrequency;
    } else {
      recommendedMin = rule.range_min;
      recommendedMax = rule.range_max;
    }
    steps.push({
      label: '推奨レンジ(明示)',
      expr: `${rule.range_min}〜${rule.range_max} ${rule.base_unit}`,
      value: `${roundValue(recommendedMin)}〜${roundValue(recommendedMax)} mg/回`,
    });
  } else {
    // デフォルト±%でレンジ生成
    rangePolicy = 'PERCENT_AROUND_BASE';
    const factor = rangePercent / 100;
    recommendedMin = baseSingleDose * (1 - factor);
    recommendedMax = baseSingleDose * (1 + factor);
    steps.push({
      label: '許容率',
      expr: 'p',
      value: `±${rangePercent}%`,
    });
    steps.push({
      label: '推奨下限(1回)',
      expr: `${roundValue(baseSingleDose)} × (1 - ${factor})`,
      value: `${roundValue(recommendedMin)} mg/回`,
    });
    steps.push({
      label: '推奨上限(1回)',
      expr: `${roundValue(baseSingleDose)} × (1 + ${factor})`,
      value: `${roundValue(recommendedMax)} mg/回`,
    });
  }

  // 処方未入力の場合はここで返す（推奨レンジのみ表示用）
  if (!hasPrescriptionInput) {
    return {
      status: 'warning',
      statusLabel: '処方未入力',
      appliedRule: rule,
      rangePolicy,
      rangePercent,
      baseDailyDose: roundValue(baseDailyDose),
      baseSingleDose: roundValue(baseSingleDose),
      recommendedMin: roundValue(recommendedMin),
      recommendedMax: roundValue(recommendedMax),
      prescribedSingleDose: 0,
      prescribedDailyDose: 0,
      steps,
      warnings,
    };
  }

  // 最大量チェック
  if (rule.max_single_mg && prescribedSingleDoseMg > rule.max_single_mg) {
    warnings.push(`1回最大量(${rule.max_single_mg}mg)を超過`);
  }
  if (rule.max_daily_mg && prescribedDailyDoseMg > rule.max_daily_mg) {
    warnings.push(`1日最大量(${rule.max_daily_mg}mg)を超過`);
  }

  // 判定
  let status: JudgmentStatus;
  let statusLabel: string;

  const roundedPrescribed = roundValue(prescribedSingleDoseMg);
  const roundedMin = roundValue(recommendedMin);
  const roundedMax = roundValue(recommendedMax);

  if (roundedPrescribed >= roundedMin && roundedPrescribed <= roundedMax) {
    if (warnings.length === 0) {
      status = 'ok';
      statusLabel = '適正';
    } else {
      status = 'warning';
      statusLabel = '注意';
    }
  } else if (
    roundedPrescribed >= roundedMin * 0.8 &&
    roundedPrescribed <= roundedMax * 1.2
  ) {
    status = 'warning';
    statusLabel = '注意';
    if (roundedPrescribed < roundedMin) {
      warnings.push(`推奨下限をやや下回っています`);
    } else {
      warnings.push(`推奨上限をやや上回っています`);
    }
  } else {
    status = 'danger';
    statusLabel = '要確認';
    if (roundedPrescribed < roundedMin) {
      warnings.push(`推奨下限を大幅に下回っています`);
    } else {
      warnings.push(`推奨上限を大幅に上回っています`);
    }
  }

  return {
    status,
    statusLabel,
    appliedRule: rule,
    rangePolicy,
    rangePercent,
    baseDailyDose: roundValue(baseDailyDose),
    baseSingleDose: roundValue(baseSingleDose),
    recommendedMin: roundValue(recommendedMin),
    recommendedMax: roundValue(recommendedMax),
    prescribedSingleDose: roundValue(prescribedSingleDoseMg),
    prescribedDailyDose: roundValue(prescribedDailyDoseMg),
    steps,
    warnings,
  };
};

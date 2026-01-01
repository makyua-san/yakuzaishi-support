import { DrugInfo } from '@/types/drug';

// サンプル薬剤データ（実際はCSVから読み込む）
export const drugDatabase: DrugInfo[] = [
  {
    id: 'amoxicillin',
    name: 'アモキシシリン細粒',
    genericName: 'Amoxicillin',
    defaultConcentration: 100, // 100mg/g = 10%製剤
    unit: 'mg',
    rules: [
      {
        rule_id: 'AMOX-001',
        age_min_months: 0,
        age_max_months: 240, // 20歳
        wt_min_kg: 0,
        wt_max_kg: 100,
        calc_type: 'MG_PER_KG_PER_DAY',
        base_value: 20, // 20-40mg/kg/day 通常量
        base_unit: 'mg/kg/day',
        max_daily_mg: 1500,
        max_single_mg: 500,
        rounding: '小数第1位四捨五入',
        note: '通常量。感染症の種類により増量を検討',
        source_title: '添付文書',
        source_version: '2024年4月改訂',
        source_ref: 'PMDA',
        range_min: undefined,
        range_max: undefined,
      },
      {
        rule_id: 'AMOX-002',
        age_min_months: 0,
        age_max_months: 240,
        wt_min_kg: 0,
        wt_max_kg: 100,
        calc_type: 'MG_PER_KG_PER_DAY',
        base_value: 40, // 高用量
        base_unit: 'mg/kg/day',
        max_daily_mg: 3000,
        max_single_mg: 1000,
        rounding: '小数第1位四捨五入',
        note: '高用量（中耳炎、肺炎球菌感染症等）',
        source_title: '添付文書',
        source_version: '2024年4月改訂',
        source_ref: 'PMDA',
        range_min: 30,
        range_max: 50,
      },
    ],
  },
  {
    id: 'acetaminophen',
    name: 'アセトアミノフェン細粒',
    genericName: 'Acetaminophen',
    defaultConcentration: 200, // 200mg/g = 20%製剤
    unit: 'mg',
    rules: [
      {
        rule_id: 'ACE-001',
        age_min_months: 0,
        age_max_months: 240,
        wt_min_kg: 0,
        wt_max_kg: 100,
        calc_type: 'MG_PER_KG_PER_DOSE',
        base_value: 10, // 10-15mg/kg/dose
        base_unit: 'mg/kg/回',
        max_daily_mg: 4000,
        max_single_mg: 500,
        rounding: '小数第1位四捨五入',
        note: '1日総量として60mg/kg/dayを超えないこと',
        source_title: '添付文書',
        source_version: '2024年6月改訂',
        source_ref: 'PMDA',
        range_min: 10,
        range_max: 15,
      },
    ],
  },
  {
    id: 'clarithromycin',
    name: 'クラリスロマイシンDS',
    genericName: 'Clarithromycin',
    defaultConcentration: 100, // 100mg/g = 10%製剤
    unit: 'mg',
    rules: [
      {
        rule_id: 'CAM-001',
        age_min_months: 0,
        age_max_months: 240,
        wt_min_kg: 0,
        wt_max_kg: 100,
        calc_type: 'MG_PER_KG_PER_DAY',
        base_value: 10, // 10-15mg/kg/day
        base_unit: 'mg/kg/day',
        max_daily_mg: 800,
        max_single_mg: 400,
        rounding: '小数第1位四捨五入',
        note: '通常1日10-15mg/kgを2回に分けて投与',
        source_title: '添付文書',
        source_version: '2024年3月改訂',
        source_ref: 'PMDA',
        range_min: 10,
        range_max: 15,
      },
    ],
  },
];

export const getDrugById = (id: string): DrugInfo | undefined => {
  return drugDatabase.find(drug => drug.id === id);
};

export const searchDrugs = (query: string): DrugInfo[] => {
  const lowerQuery = query.toLowerCase();
  return drugDatabase.filter(
    drug =>
      drug.name.toLowerCase().includes(lowerQuery) ||
      drug.genericName.toLowerCase().includes(lowerQuery)
  );
};

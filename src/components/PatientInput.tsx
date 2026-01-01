import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientInfo } from '@/types/drug';
import { User, Scale, Check } from 'lucide-react';

interface PatientInputProps {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
}

const AGE_PRESETS = [
  { label: '6か月', years: 0, months: 6 },
  { label: '1歳', years: 1, months: 0 },
  { label: '1歳半', years: 1, months: 6 },
  { label: '2歳', years: 2, months: 0 },
  { label: '3歳', years: 3, months: 0 },
  { label: '4歳', years: 4, months: 0 },
  { label: '5歳', years: 5, months: 0 },
  { label: '6歳', years: 6, months: 0 },
  { label: '8歳', years: 8, months: 0 },
  { label: '10歳', years: 10, months: 0 },
  { label: '12歳', years: 12, months: 0 },
];

const WEIGHT_PRESETS = [5, 7, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40];

export const PatientInput = ({ patient, onChange }: PatientInputProps) => {
  const isAgeSelected = (years: number, months: number) =>
    patient.ageYears === years && patient.ageMonths === months;

  const isWeightSelected = (weight: number) => patient.weightKg === weight;

  return (
    <div className="space-y-8">
      {/* 年齢セクション */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-5 w-5" />
          <Label className="text-base font-medium">年齢</Label>
        </div>

        {/* プリセットボタン */}
        <div className="grid grid-cols-4 gap-2">
          {AGE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant={isAgeSelected(preset.years, preset.months) ? 'default' : 'outline'}
              size="sm"
              className="relative"
              onClick={() =>
                onChange({
                  ...patient,
                  ageYears: preset.years,
                  ageMonths: preset.months,
                })
              }
            >
              {preset.label}
              {isAgeSelected(preset.years, preset.months) && (
                <Check className="h-3 w-3 absolute top-1 right-1" />
              )}
            </Button>
          ))}
        </div>

        {/* 詳細入力 */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">詳細:</span>
          <Input
            type="number"
            min={0}
            max={20}
            value={patient.ageYears || ''}
            onChange={(e) =>
              onChange({
                ...patient,
                ageYears: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            placeholder="0"
            className="w-16 text-center"
          />
          <span className="text-sm">歳</span>
          <Input
            type="number"
            min={0}
            max={11}
            value={patient.ageMonths || ''}
            onChange={(e) =>
              onChange({
                ...patient,
                ageMonths: Math.min(11, Math.max(0, parseInt(e.target.value) || 0)),
              })
            }
            placeholder="0"
            className="w-16 text-center"
          />
          <span className="text-sm">か月</span>
        </div>
      </div>

      {/* 体重セクション */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Scale className="h-5 w-5" />
          <Label className="text-base font-medium">体重</Label>
        </div>

        {/* プリセットボタン */}
        <div className="grid grid-cols-4 gap-2">
          {WEIGHT_PRESETS.map((weight) => (
            <Button
              key={weight}
              type="button"
              variant={isWeightSelected(weight) ? 'default' : 'outline'}
              size="sm"
              className="relative"
              onClick={() =>
                onChange({
                  ...patient,
                  weightKg: weight,
                })
              }
            >
              {weight}kg
              {isWeightSelected(weight) && (
                <Check className="h-3 w-3 absolute top-1 right-1" />
              )}
            </Button>
          ))}
        </div>

        {/* 詳細入力 */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">詳細:</span>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={patient.weightKg || ''}
            onChange={(e) =>
              onChange({
                ...patient,
                weightKg: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            placeholder="12.5"
            className="w-24 text-center"
          />
          <span className="text-sm">kg</span>
        </div>
      </div>
    </div>
  );
};

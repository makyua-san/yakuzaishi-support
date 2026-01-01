import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PatientInfo } from '@/types/drug';
import { User, Scale } from 'lucide-react';

interface PatientInputProps {
  patient: PatientInfo;
  onChange: (patient: PatientInfo) => void;
}

const AGE_MAX_YEARS = 16;
const AGE_MAX_MONTHS = AGE_MAX_YEARS * 12;
const WEIGHT_MAX_KG = 100;

export const PatientInput = ({ patient, onChange }: PatientInputProps) => {
  const ageInMonths = Math.min(
    AGE_MAX_MONTHS,
    Math.max(0, patient.ageYears * 12 + patient.ageMonths)
  );
  const weightValue = Math.min(WEIGHT_MAX_KG, Math.max(0, patient.weightKg || 0));

  const setAgeByMonths = (months: number) => {
    const clamped = Math.max(0, Math.min(AGE_MAX_MONTHS, Math.round(months)));
    onChange({
      ...patient,
      ageYears: Math.floor(clamped / 12),
      ageMonths: clamped % 12,
    });
  };

  const setWeight = (weight: number) => {
    const clamped = Math.max(0, Math.min(WEIGHT_MAX_KG, weight));
    onChange({
      ...patient,
      weightKg: parseFloat(clamped.toFixed(1)),
    });
  };

  return (
    <div className="space-y-8">
      {/* 年齢セクション */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-primary">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <Label className="text-base font-medium">年齢</Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {`${patient.ageYears || 0}歳 ${patient.ageMonths || 0}か月`}
          </span>
        </div>

        <div className="space-y-3">
          <Slider
            value={[ageInMonths]}
            min={0}
            max={AGE_MAX_MONTHS}
            step={1}
            onValueChange={(value) => setAgeByMonths(value[0])}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>0歳</span>
            <div className="h-px w-full rounded-full bg-border" />
            <span>{AGE_MAX_YEARS}歳</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">詳細入力:</span>
          <Input
            type="number"
            min={0}
            max={AGE_MAX_YEARS}
            value={patient.ageYears || ''}
            onChange={(e) =>
              setAgeByMonths(
                (Math.min(AGE_MAX_YEARS, Math.max(0, parseInt(e.target.value) || 0)) * 12) +
                  patient.ageMonths
              )
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
              setAgeByMonths(
                patient.ageYears * 12 +
                  Math.min(11, Math.max(0, parseInt(e.target.value) || 0))
              )
            }
            placeholder="0"
            className="w-16 text-center"
          />
          <span className="text-sm">か月</span>
        </div>
      </div>

      {/* 体重セクション */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-primary">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            <Label className="text-base font-medium">体重</Label>
          </div>
          <span className="text-sm text-muted-foreground">{`${weightValue || 0} kg`}</span>
        </div>

        <div className="space-y-3">
          <Slider
            value={[weightValue]}
            min={0}
            max={WEIGHT_MAX_KG}
            step={0.1}
            onValueChange={(value) => setWeight(value[0])}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>0kg</span>
            <div className="h-px w-full rounded-full bg-border" />
            <span>{WEIGHT_MAX_KG}kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-sm text-muted-foreground">詳細入力:</span>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={patient.weightKg || ''}
            onChange={(e) =>
              setWeight(parseFloat(e.target.value) || 0)
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

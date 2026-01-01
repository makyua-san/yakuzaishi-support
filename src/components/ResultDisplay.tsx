import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalculationResult, DrugInfo, PrescriptionInfo } from '@/types/drug';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Beaker,
} from 'lucide-react';

interface ResultDisplayProps {
  result: CalculationResult;
  drug: DrugInfo;
  rangePercent: number;
  onRangePercentChange: (percent: number) => void;
  prescription: PrescriptionInfo;
  onPrescriptionChange: (prescription: PrescriptionInfo) => void;
}

export const ResultDisplay = ({
  result,
  drug,
  rangePercent,
  onRangePercentChange,
  prescription,
  onPrescriptionChange,
}: ResultDisplayProps) => {
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  const statusConfig = {
    ok: {
      icon: CheckCircle2,
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      borderClass: 'border-success/30',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-warning/10',
      textClass: 'text-warning',
      borderClass: 'border-warning/30',
    },
    danger: {
      icon: XCircle,
      bgClass: 'bg-destructive/10',
      textClass: 'text-destructive',
      borderClass: 'border-destructive/30',
    },
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  // 処方が入力されているかチェック
  const hasPrescription = prescription.singleDose > 0;

  return (
    <div className="space-y-4">
      {/* 推奨用量表示 */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            推奨用量
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">基準1回量</p>
              <p className="text-2xl font-bold text-primary">
                {result.baseSingleDose} mg
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">基準1日量</p>
              <p className="text-2xl font-bold text-primary">
                {result.baseDailyDose} mg
              </p>
            </div>
          </div>

          <div className="p-3 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">推奨レンジ（1回量）</p>
              {result.rangePolicy === 'PERCENT_AROUND_BASE' && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="rangePercent" className="text-xs text-muted-foreground">
                    ±
                  </Label>
                  <Input
                    id="rangePercent"
                    type="number"
                    min={5}
                    max={50}
                    value={rangePercent}
                    onChange={(e) =>
                      onRangePercentChange(
                        Math.min(50, Math.max(5, parseInt(e.target.value) || 20))
                      )
                    }
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              )}
            </div>
            <p className="text-lg font-semibold">
              {result.recommendedMin} 〜 {result.recommendedMax} mg
            </p>
            {result.rangePolicy === 'EXPLICIT' && (
              <p className="text-xs text-muted-foreground mt-1">
                ※ 添付文書に明示されたレンジ
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 計算過程（常に表示、フロー形式） */}
      <Collapsible open={isStepsOpen} onOpenChange={setIsStepsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">計算の根拠と過程</CardTitle>
                </div>
                {isStepsOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* エビデンス情報 */}
              {result.appliedRule && (
                <div className="p-4 bg-accent/30 rounded-lg border border-accent">
                  <p className="text-sm font-medium text-accent-foreground mb-2">
                    📚 根拠となる情報
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">参照元:</span>
                      <span className="font-medium">{result.appliedRule.source_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">版:</span>
                      <span>{result.appliedRule.source_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">用法:</span>
                      <span className="font-medium">{result.appliedRule.base_unit}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-muted-foreground">注記: </span>
                      <span>{result.appliedRule.note}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 計算フロー */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">📐 計算過程</p>
                <div className="space-y-2">
                  {result.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{step.label}</span>
                          {step.expr && (
                            <>
                              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {step.expr}
                              </code>
                            </>
                          )}
                          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-semibold text-primary">{step.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 処方入力（オプション） */}
      <Collapsible open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
        <Card className={hasPrescription ? config.borderClass + ' border-2' : ''}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beaker className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    処方量と比較（オプション）
                  </CardTitle>
                </div>
                {isPrescriptionOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* 処方入力フォーム */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="singleDose" className="text-sm">
                    1回量
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="singleDose"
                      type="number"
                      min={0}
                      step={0.1}
                      value={prescription.singleDose || ''}
                      onChange={(e) =>
                        onPrescriptionChange({
                          ...prescription,
                          singleDose: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      placeholder="例: 150"
                      className="flex-1"
                    />
                    <Select
                      value={prescription.unit}
                      onValueChange={(value: 'mg' | 'mL') =>
                        onPrescriptionChange({ ...prescription, unit: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="mL">mL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm">
                    1日回数
                  </Label>
                  <Select
                    value={String(prescription.dailyFrequency)}
                    onValueChange={(value) =>
                      onPrescriptionChange({
                        ...prescription,
                        dailyFrequency: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1回/日</SelectItem>
                      <SelectItem value="2">2回/日</SelectItem>
                      <SelectItem value="3">3回/日</SelectItem>
                      <SelectItem value="4">4回/日</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {prescription.unit === 'mL' && (
                <div className="space-y-2">
                  <Label htmlFor="concentration" className="text-sm">
                    濃度 (mg/mL)
                  </Label>
                  <Input
                    id="concentration"
                    type="number"
                    min={0}
                    step={0.1}
                    value={prescription.concentration || ''}
                    onChange={(e) =>
                      onPrescriptionChange({
                        ...prescription,
                        concentration: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder={drug.defaultConcentration ? `例: ${drug.defaultConcentration}` : '例: 10'}
                  />
                </div>
              )}

              {/* 判定結果 */}
              {hasPrescription && (
                <>
                  <div className="h-px bg-border" />
                  
                  {/* ステータス表示 */}
                  <div className={`p-4 rounded-lg ${config.bgClass}`}>
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-10 w-10 ${config.textClass}`} />
                      <div>
                        <p className={`text-xl font-bold ${config.textClass}`}>
                          {result.statusLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          処方量: {result.prescribedSingleDose} mg/回 → {result.prescribedDailyDose} mg/日
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 警告メッセージ */}
                  {result.warnings.length > 0 && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          {result.warnings.map((warning, index) => (
                            <p key={index} className="text-sm">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 比較表 */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground text-xs">推奨下限</p>
                      <p className="font-semibold">{result.recommendedMin} mg</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded border-2 border-primary/30">
                      <p className="text-muted-foreground text-xs">処方量</p>
                      <p className="font-bold text-primary">{result.prescribedSingleDose} mg</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground text-xs">推奨上限</p>
                      <p className="font-semibold">{result.recommendedMax} mg</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 根拠情報詳細 */}
      {result.appliedRule && (
        <Collapsible open={isSourceOpen} onOpenChange={setIsSourceOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base text-muted-foreground">
                      詳細な根拠情報
                    </CardTitle>
                  </div>
                  {isSourceOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ルールID</p>
                    <p className="font-medium font-mono">{result.appliedRule.rule_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">計算タイプ</p>
                    <p className="font-medium">{result.appliedRule.calc_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">対象月齢</p>
                    <p className="font-medium">
                      {result.appliedRule.age_min_months}〜{result.appliedRule.age_max_months}か月
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">対象体重</p>
                    <p className="font-medium">
                      {result.appliedRule.wt_min_kg}〜{result.appliedRule.wt_max_kg}kg
                    </p>
                  </div>
                </div>
                {result.appliedRule.source_ref && (
                  <div>
                    <p className="text-sm text-muted-foreground">参照URL</p>
                    <p className="text-sm font-medium break-all">
                      {result.appliedRule.source_ref}
                    </p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* 免責事項 */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ※ 本アプリは用量計算の支援ツールです。最終判断は必ず薬剤師が行い、
            添付文書・施設基準・患者状態を優先してください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

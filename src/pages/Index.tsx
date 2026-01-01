import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DrugSelector } from '@/components/DrugSelector';
import { PatientInput } from '@/components/PatientInput';
import { ResultDisplay } from '@/components/ResultDisplay';
import { DrugInfo, PatientInfo, PrescriptionInfo, CalculationResult } from '@/types/drug';
import { getDrugById } from '@/data/drugs';
import { calculateDosage } from '@/lib/calculator';
import { ArrowLeft, ArrowRight, Pill, AlertTriangle } from 'lucide-react';

type Step = 'drug' | 'patient' | 'result';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('drug');
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [drugHistory, setDrugHistory] = useState<DrugInfo[]>([]);
  const [patient, setPatient] = useState<PatientInfo>({
    ageYears: 0,
    ageMonths: 0,
    weightKg: 0,
  });
  const [prescription, setPrescription] = useState<PrescriptionInfo>({
    singleDose: 0,
    dailyFrequency: 3,
    unit: 'mg',
  });
  const [rangePercent, setRangePercent] = useState(20);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(0);

  const steps: { key: Step; label: string; number: number }[] = [
    { key: 'drug', label: '薬剤選択', number: 1 },
    { key: 'patient', label: '患者情報', number: 2 },
    { key: 'result', label: '結果', number: 3 },
  ];

  useEffect(() => {
    const storedIds = localStorage.getItem('drugHistory');
    if (!storedIds) return;
    try {
      const ids: string[] = JSON.parse(storedIds);
      const restored = ids
        .map((id) => getDrugById(id))
        .filter((drug): drug is DrugInfo => Boolean(drug));
      setDrugHistory(restored);
    } catch (e) {
      console.error('Failed to restore history', e);
      localStorage.removeItem('drugHistory');
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'drug':
        return selectedDrug !== null;
      case 'patient':
        return patient.weightKg > 0;
      default:
        return true;
    }
  }, [currentStep, selectedDrug, patient]);

  const result: CalculationResult | null = useMemo(() => {
    if (!selectedDrug || patient.weightKg <= 0) {
      return null;
    }
    return calculateDosage(selectedDrug, patient, prescription, rangePercent, selectedRuleIndex);
  }, [selectedDrug, patient, prescription, rangePercent, selectedRuleIndex]);

  const handleSelectDrug = (drug: DrugInfo) => {
    setSelectedDrug(drug);
    setDrugHistory((prev) => {
      const next = [drug, ...prev.filter((d) => d.id !== drug.id)].slice(0, 5);
      localStorage.setItem('drugHistory', JSON.stringify(next.map((d) => d.id)));
      return next;
    });
    setCurrentStep('patient');
  };

  const clearHistory = () => {
    setDrugHistory([]);
    localStorage.removeItem('drugHistory');
  };

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const reset = () => {
    setCurrentStep('drug');
    setSelectedDrug(null);
    setPatient({ ageYears: 0, ageMonths: 0, weightKg: 0 });
    setPrescription({ singleDose: 0, dailyFrequency: 3, unit: 'mg' });
    setRangePercent(20);
    setSelectedRuleIndex(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">小児用量チェッカー</h1>
              <p className="text-sm text-muted-foreground">
                処方用量の妥当性を確認
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex w-full flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      index <= currentStepIndex
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 mx-2 flex-1 min-w-[16px] max-w-[64px] sm:max-w-[96px] md:max-w-[128px] ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 注意バナー */}
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              本アプリは用量計算の支援ツールです。最終判断は必ず薬剤師が行ってください。
            </p>
          </CardContent>
        </Card>

        {/* ステップコンテンツ */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{steps[currentStepIndex].label}</CardTitle>
              {currentStep === 'patient' && selectedDrug && (
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2 w-fit">
                  <div className="p-2 bg-muted text-muted-foreground rounded-full">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">選択中の薬剤:</span>
                    <span className="text-sm font-medium leading-tight">{selectedDrug.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({selectedDrug.genericName})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === 'drug' && (
              <DrugSelector
                onSelect={handleSelectDrug}
                selectedDrug={selectedDrug}
                history={drugHistory}
                onClearHistory={clearHistory}
              />
            )}

            {currentStep === 'patient' && (
              <PatientInput
                patient={patient}
                onChange={setPatient}
                selectedDrug={selectedDrug}
              />
            )}

            {currentStep === 'result' && result && selectedDrug && (
              <>
                {/* ルール選択（複数ルールがある場合） */}
                {selectedDrug.rules.length > 1 && (
                  <div className="mb-6 p-4 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-2">適用ルール選択</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDrug.rules.map((rule, index) => (
                        <Button
                          key={rule.rule_id}
                          variant={selectedRuleIndex === index ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedRuleIndex(index)}
                        >
                          {rule.note.substring(0, 20)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <ResultDisplay
                  result={result}
                  drug={selectedDrug}
                  rangePercent={rangePercent}
                  onRangePercentChange={setRangePercent}
                  prescription={prescription}
                  onPrescriptionChange={setPrescription}
                  onBack={goToPrev}
                  onNewCheck={reset}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* ナビゲーションボタン（結果画面では固定バーに置き換え） */}
        {currentStep !== 'result' && (
          <div className="flex justify-between gap-4">
            {currentStepIndex > 0 ? (
              <Button variant="outline" onClick={goToPrev} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {currentStep === 'drug' ? (
              <div className="flex-1" />
            ) : (
              <Button
                onClick={goToNext}
                disabled={!canProceed}
                className="flex-1"
              >
                次へ
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground max-w-2xl">
          <p>© 2026 小児用量チェッカー - 薬剤師向け支援ツール</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

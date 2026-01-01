import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DrugInfo } from '@/types/drug';
import { searchDrugs, drugDatabase } from '@/data/drugs';
import { Search, Pill } from 'lucide-react';

interface DrugSelectorProps {
  onSelect: (drug: DrugInfo) => void;
  selectedDrug: DrugInfo | null;
  history: DrugInfo[];
  onClearHistory: () => void;
}

export const DrugSelector = ({
  onSelect,
  selectedDrug,
  history,
  onClearHistory,
}: DrugSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) {
      return drugDatabase;
    }
    return searchDrugs(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">最近選択した薬剤</p>
            <Button variant="ghost" size="sm" onClick={onClearHistory}>
              履歴をクリア
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((drug) => (
              <Button
                key={drug.id}
                variant="ghost"
                size="sm"
                onClick={() => onSelect(drug)}
                className="justify-start text-muted-foreground border border-border"
              >
                {drug.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="薬剤名を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3">
        {filteredDrugs.map((drug) => (
          <Card
            key={drug.id}
            className="cursor-pointer transition-all hover:bg-secondary/40 border border-border"
            onClick={() => onSelect(drug)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{drug.name}</p>
                <p className="text-sm text-muted-foreground">{drug.genericName}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDrugs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            該当する薬剤が見つかりません
          </p>
        )}
      </div>
    </div>
  );
};

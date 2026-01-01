import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DrugInfo } from '@/types/drug';
import { searchDrugs, drugDatabase } from '@/data/drugs';
import { Search, Pill } from 'lucide-react';

interface DrugSelectorProps {
  onSelect: (drug: DrugInfo) => void;
  selectedDrug: DrugInfo | null;
}

export const DrugSelector = ({ onSelect, selectedDrug }: DrugSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) {
      return drugDatabase;
    }
    return searchDrugs(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
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
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDrug?.id === drug.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-secondary/50'
            }`}
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
              {selectedDrug?.id === drug.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
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

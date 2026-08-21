import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Simple date utilities without external dependencies
const startOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const endOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });
};

const PRESET_RANGES = [
  {
    label: "Today",
    value: "today",
    getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    label: "Yesterday",
    value: "yesterday",
    getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    },
  },
  {
    label: "Last 7 days",
    value: "last-7",
    getRange: () => {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(new Date()) };
    },
  },
  {
    label: "Last 30 days",
    value: "last-30",
    getRange: () => {
      const from = new Date();
      from.setDate(from.getDate() - 29);
      return { from: startOfDay(from), to: endOfDay(new Date()) };
    },
  },
  {
    label: "Last 90 days",
    value: "last-90",
    getRange: () => {
      const from = new Date();
      from.setDate(from.getDate() - 89);
      return { from: startOfDay(from), to: endOfDay(new Date()) };
    },
  },
  {
    label: "This month",
    value: "this-month",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [fromInput, setFromInput] = React.useState("");
  const [toInput, setToInput] = React.useState("");

  React.useEffect(() => {
    if (value?.from) {
      setFromInput(value.from.toISOString().split('T')[0] || "");
    } else {
      setFromInput("");
    }
    if (value?.to) {
      setToInput(value.to.toISOString().split('T')[0] || "");
    } else {
      setToInput("");
    }
  }, [value]);

  const handlePresetChange = (presetValue: string) => {
    const preset = PRESET_RANGES.find(p => p.value === presetValue);
    if (preset && onChange) {
      const range = preset.getRange();
      onChange(range);
    }
  };

  const handleFromChange = (dateString: string) => {
    setFromInput(dateString);
    if (dateString) {
      const date = new Date(dateString + "T00:00:00");
      if (!isNaN(date.getTime()) && onChange) {
        const newRange = { from: startOfDay(date), to: value?.to };
        onChange(newRange);
      }
    } else if (onChange) {
      onChange({ from: undefined, to: value?.to });
    }
  };

  const handleToChange = (dateString: string) => {
    setToInput(dateString);
    if (dateString) {
      const date = new Date(dateString + "T23:59:59");
      if (!isNaN(date.getTime()) && onChange) {
        const newRange = { from: value?.from, to: endOfDay(date) };
        onChange(newRange);
      }
    } else if (onChange) {
      onChange({ from: value?.from, to: undefined });
    }
  };

  const clearRange = () => {
    if (onChange) {
      onChange({ from: undefined, to: undefined });
    }
    setFromInput("");
    setToInput("");
  };

  const formatDisplayText = () => {
    if (!value?.from && !value?.to) return placeholder;
    if (value.from && value.to) {
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    }
    if (value.from) {
      return `From ${formatDate(value.from)}`;
    }
    if (value.to) {
      return `Until ${formatDate(value.to)}`;
    }
    return placeholder;
  };

  const hasError = React.useMemo(() => {
    if (!value?.from || !value?.to) return false;
    return value.from.getTime() > value.to.getTime();
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal",
          !value?.from && !value?.to && "text-muted-foreground",
          hasError && "border-red-500 text-red-500"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayText()}
        {(value?.from || value?.to) && (
          <X
            className="ml-auto h-4 w-4 hover:bg-muted rounded"
            onClick={(e) => {
              e.stopPropagation();
              clearRange();
            }}
          />
        )}
      </Button>

      {hasError && (
        <p className="text-sm text-red-500 mt-1">
          Start date cannot be after end date
        </p>
      )}

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 z-50 w-full min-w-[320px]">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <Label className="text-sm font-medium">Quick Select</Label>
                <Select onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_RANGES.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="from-date" className="text-sm font-medium">
                    From Date
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromInput}
                    onChange={(e) => handleFromChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date" className="text-sm font-medium">
                    To Date
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toInput}
                    onChange={(e) => handleToChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearRange}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
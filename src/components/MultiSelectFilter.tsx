import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Label } from './ui/label';
import { ChevronDown, X, Search } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area@1.2.3';

interface MultiSelectFilterProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select items...",
}: MultiSelectFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeItem = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  const selectAll = () => {
    onChange(filteredOptions.map(option => option.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getSelectedLabels = () => {
    return options
      .filter(option => selectedValues.includes(option.value))
      .map(option => option.label);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto min-h-10 p-2"
          >
            <div className="flex flex-wrap gap-1.5 flex-1">
              {selectedValues.length === 0 ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : (
                getSelectedLabels().map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      const option = options.find(opt => opt.label === label);
                      if (option) removeItem(option.value);
                    }}
                  >
                    {label}
                    <X className="ml-1 w-3 h-3" />
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="w-4 h-4 opacity-50 ml-2 shrink-0" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="flex flex-col">
            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
              <span className="text-xs text-gray-600">
                {selectedValues.length} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="h-7 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs"
                  disabled={selectedValues.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Options List */}
            <ScrollArea className="h-[300px]">
              <ScrollAreaPrimitive.Viewport className="h-full w-full">
                <div className="p-2">
                  {filteredOptions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500">
                      No results found
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => toggleItem(option.value)}
                      >
                        <Checkbox
                          checked={selectedValues.includes(option.value)}
                          onCheckedChange={() => toggleItem(option.value)}
                        />
                        <label className="flex-1 text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollAreaPrimitive.Viewport>
              <ScrollBar />
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-gray-500">
        {selectedValues.length === 0
          ? `All ${label.toLowerCase()} will be included`
          : `Filtered to ${selectedValues.length} ${label.toLowerCase()}`}
      </p>
    </div>
  );
}
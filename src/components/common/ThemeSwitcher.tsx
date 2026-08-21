import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Monitor, Moon, Sun, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode } from '@/types';

const themeModeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, themeMode, availableThemes, setTheme, setThemeMode } = useTheme();

  const currentIcon = themeModeIcons[themeMode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          {React.createElement(currentIcon, { className: "h-4 w-4" })}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme Mode Selection */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
          const Icon = themeModeIcons[mode];
          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => setThemeMode(mode)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{t(`theme.${mode}`)}</span>
              {themeMode === mode && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        {/* Theme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme Style
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {availableThemes.map((availableTheme) => (
              <DropdownMenuItem
                key={availableTheme.id}
                onClick={() => setTheme(availableTheme)}
                className="flex items-center gap-2"
              >
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{
                    backgroundColor: `hsl(${availableTheme.colors.primary})`,
                  }}
                />
                <span>{t(`theme.${availableTheme.id}`)}</span>
                {theme.id === availableTheme.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
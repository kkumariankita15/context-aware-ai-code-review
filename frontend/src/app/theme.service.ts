import { Injectable } from '@angular/core';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  strong: string;
  soft: string;
  accent: string;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ThemePreset[] = [
    { id: 'violet', name: 'Iris', description: 'Creative & composed', primary: '#6d5ce8', strong: '#5746d2', soft: '#f0edff', accent: '#988cf2' },
    { id: 'blue', name: 'Ocean', description: 'Focused & calm', primary: '#3978e5', strong: '#2862c7', soft: '#eaf2ff', accent: '#83aaf2' },
    { id: 'green', name: 'Sage', description: 'Fresh & balanced', primary: '#24886b', strong: '#176d54', soft: '#e7f5ef', accent: '#72b99d' },
    { id: 'rose', name: 'Berry', description: 'Warm & expressive', primary: '#d34f76', strong: '#b63c61', soft: '#fff0f4', accent: '#e58ba5' }
  ];

  activeThemeId = 'violet';
  customAccent = '#6d5ce8';

  get activeThemeName(): string {
    return this.activeThemeId === 'custom'
      ? 'Custom accent'
      : this.themes.find(theme => theme.id === this.activeThemeId)?.name || 'Iris';
  }

  restore(): void {
    const savedTheme = localStorage.getItem('reviewpilot-theme');
    if (!savedTheme) {
      return;
    }

    const saved = JSON.parse(savedTheme) as { id?: string; accent?: string };
    const theme = this.themes.find(item => item.id === saved.id);
    if (theme) {
      this.select(theme);
    } else if (saved.id === 'custom' && saved.accent && /^#[0-9a-f]{6}$/i.test(saved.accent)) {
      this.setCustomAccent(saved.accent);
    }
  }

  select(theme: ThemePreset): void {
    this.activeThemeId = theme.id;
    this.customAccent = theme.primary;
    this.applyAccent(theme.primary, theme.strong, theme.soft, theme.accent);
    this.save();
  }

  setCustomAccent(color: string): void {
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      return;
    }

    this.activeThemeId = 'custom';
    this.customAccent = color;
    this.applyAccent(
      color,
      `color-mix(in srgb, ${color} 78%, #172033)`,
      `color-mix(in srgb, ${color} 10%, white)`,
      `color-mix(in srgb, ${color} 65%, white)`
    );
    this.save();
  }

  private applyAccent(primary: string, strong: string, soft: string, accent: string): void {
    const root = document.documentElement.style;
    root.setProperty('--color-primary', primary);
    root.setProperty('--color-primary-strong', strong);
    root.setProperty('--color-primary-soft', soft);
    root.setProperty('--color-accent', accent);
  }

  private save(): void {
    localStorage.setItem('reviewpilot-theme', JSON.stringify({
      id: this.activeThemeId,
      accent: this.customAccent
    }));
  }
}

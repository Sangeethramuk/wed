// Theme configuration with 4 variants
export type ThemeVariant = "twitter-light" | "twitter-dark" | "violet-light" | "violet-dark";

export interface ThemeConfig {
  name: string;
  variant: ThemeVariant;
  icon: string;
  description: string;
}

export const themes: ThemeConfig[] = [
  {
    name: "Twitter Light",
    variant: "twitter-light",
    icon: "☀️",
    description: "Clean light theme with blue accents",
  },
  {
    name: "Twitter Dark",
    variant: "twitter-dark",
    icon: "🌙",
    description: "Dark theme with blue accents",
  },
  {
    name: "Brand Light",
    variant: "violet-light",
    icon: "💜",
    description: "EducAItors brand — navy on near-white",
  },
  {
    name: "Violet Bloom Dark",
    variant: "violet-dark",
    icon: "🔮",
    description: "Rich dark theme with violet accents",
  },
];

export const defaultTheme: ThemeVariant = "violet-light";

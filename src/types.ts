export type Code = {
  lang: string | undefined;
  html: string;
};

export type MessageType = {
  index: number;
  url: string;
  codes: Code[];
};

export const TRIGGERS = ["always", "click"] as const;

export const LAYOUTS = [
  "2cols-2rows",
  "2cols-1rows",
  "3cols-2rows",
  "3cols-1rows",
] as const;

export type Config = {
  trigger: (typeof TRIGGERS)[number];
  theme: string;
  layout: (typeof LAYOUTS)[number];
  isDebugMode: boolean;
};

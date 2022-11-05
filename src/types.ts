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

export const LAYOUTS = ["two-rows", "three-rows"] as const;

export type Config = {
  trigger: typeof TRIGGERS[number];
  theme: string;
  layout: typeof LAYOUTS[number];
  isDebugMode: boolean;
};

export type Code = {
  lang: string | undefined;
  html: string;
};

export type MessageType = {
  url: string;
  codes: Code[];
};

export const TRIGGERS = ["always", "click"] as const;

export type Config = {
  trigger: typeof TRIGGERS[number];
  theme: string;
  isDebugMode: boolean;
}
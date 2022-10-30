export type Code = {
  lang: string | undefined;
  html: string;
};

export type MessageType = {
  url: string;
  codes: Code[];
};

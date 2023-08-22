import { Environment } from "nunjucks";

declare module "nunjucks-markdown" {
  const markdown: {
    register: (
      env: Environment,
      parserFunction: (input: string) => string,
    ) => void;
  };
  export = markdown;
}

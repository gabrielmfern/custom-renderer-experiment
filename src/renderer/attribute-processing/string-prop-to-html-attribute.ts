import type { PropValue } from "./prop-to-html-attribute";

export function stringPropToHtmlAttribute(name: string, value: PropValue) {
  if (
    typeof value !== "function" &&
    typeof value !== "symbol" &&
    typeof value !== "boolean"
  ) {
    return ` ${name}="${value}"`;
  }
  return "";
}
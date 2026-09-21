import { useSearchParams } from "react-router-dom";
export const LINES_FLAG = "linesEnabled";
export const linesPath = (path) => `${path}?${LINES_FLAG}=true`;
export const useLinesEnabled = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get(LINES_FLAG) === "true";
};

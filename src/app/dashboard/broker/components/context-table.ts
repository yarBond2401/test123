import { createContext } from "react";

interface TableContextType {
  mutate: () => void;
}

export const TableContext = createContext<TableContextType>({
  mutate: () => {},
});
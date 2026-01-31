import { createContext, useContext, useState } from "react";

const TooltipContext = createContext(null);

export function TooltipProvider({ children }) {
  const [openId, setOpenId] = useState(null);
  return (
    <TooltipContext.Provider value={{ openId, setOpenId }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltipManager() {
  return useContext(TooltipContext);
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trpc } from "@/providers/trpc";
import { detectCurrency, formatMoney, type Currency } from "./currency";
import { setSensoryEnabled as audioSensory } from "@/audio/engine";

type StoreCtx = {
  whatsappNumber: string;
  usdRate: number;
  aedRate: number;
  announcement: string;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  sensory: boolean;
  setSensory: (v: boolean) => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const settings = trpc.store.settings.useQuery(undefined, {
    staleTime: 60_000,
  });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem("aw_currency") as Currency) || detectCurrency();
  });
  const [sensory, setSensoryState] = useState(
    () => localStorage.getItem("aw_sensory") !== "off",
  );
  const [soundOn, setSoundOnState] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("aw_currency", c);
  }, []);

  const setSensory = useCallback((v: boolean) => {
    setSensoryState(v);
    localStorage.setItem("aw_sensory", v ? "on" : "off");
    audioSensory(v);
    if (!v) setSoundOnState(false);
  }, []);

  useEffect(() => {
    audioSensory(sensory);
  }, [sensory]);

  const value = useMemo<StoreCtx>(
    () => ({
      whatsappNumber: settings.data?.whatsappNumber || "923497814918",
      usdRate: settings.data?.usdRate || 281,
      aedRate: settings.data?.aedRate || 76.6,
      announcement: settings.data?.announcement || "",
      currency,
      setCurrency,
      sensory,
      setSensory,
      soundOn,
      setSoundOn: setSoundOnState,
      introDone,
      setIntroDone,
    }),
    [settings.data, currency, sensory, soundOn, introDone, setCurrency, setSensory],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useFormat() {
  const { currency, usdRate, aedRate } = useStore();
  return useCallback(
    (pkr: number) => formatMoney(pkr, currency, usdRate, aedRate),
    [currency, usdRate, aedRate],
  );
}

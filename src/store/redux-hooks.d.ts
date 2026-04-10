import type { TypedUseSelectorHook } from "react-redux";
import type { RootState } from "./store";

export type UseAppSelector = TypedUseSelectorHook<RootState>;

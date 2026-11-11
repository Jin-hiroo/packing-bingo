import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from "react";
import {
  createPackingBingo,
  type Messages,
  type PackingBingoInstance,
  type PackingBingoOptions,
  type PackingBingoState,
} from "./core";
import { resolveStorageKey } from "./storage-key";

export interface PackingBingoProps extends Omit<PackingBingoOptions, "controlled" | "defaultChecked"> {
  /** Controlled state (one boolean per item). Update it from `onChange`. */
  checked?: readonly boolean[];
  /** Initial state for an uncontrolled card (one boolean per item), used when nothing is saved under `storageKey`. */
  defaultChecked?: readonly boolean[];
  className?: string;
  style?: CSSProperties;
}

export interface PackingBingoHandle {
  /** Clear the card and score (calls onChange). */
  reset(): void;
  /** Set the card. A one-item change plays like a tap; bigger jumps apply quietly. */
  setChecked(checked: readonly boolean[]): void;
  getState(): PackingBingoState | null;
}

type MessageKey = keyof Messages;

/**
 * A packing-list bingo card (4×4 by default; any size from 2×2 to 10×10, optionally with a FREE center). Client-only: it renders an empty <div> on the server and
 * builds the card after mount, so it is safe in Next.js (it ships with "use client").
 */
export const PackingBingo = forwardRef<PackingBingoHandle, PackingBingoProps>(function PackingBingo(props, ref) {
  const { checked, defaultChecked, className, style, onChange, onBingo, onPerfect, messages, ...config } = props;
  const host = useRef<HTMLDivElement>(null);
  const inst = useRef<PackingBingoInstance | null>(null);
  const callbacks = useRef({ onChange, onBingo, onPerfect });
  callbacks.current = { onChange, onBingo, onPerfect };
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const controlled = checked !== undefined;
  // The state to restore if the card has to be rebuilt (new items, title, …), and the storage
  // key it belongs to: checks saved under one key must not carry over to another.
  const latest = useRef<readonly boolean[] | undefined>(checked ?? defaultChecked);
  // The key the card actually saves under (derived from the items when `storageKey` is omitted).
  const storageKey = resolveStorageKey({ ...config, controlled });
  const latestKey = useRef(storageKey);
  if (controlled) latest.current = checked;

  // Rebuild only when something that shapes the markup changes. Message *functions* are left
  // out of the key and called through a ref instead, so inline arrow functions neither force a
  // rebuild on every render nor get stuck with stale closures.
  const messageShape = messages
    ? Object.fromEntries(Object.entries(messages).map(([k, v]) => [k, typeof v === "function" ? "ƒ" : v]))
    : null;
  const key = JSON.stringify({ ...config, messageShape, controlled });

  useEffect(() => {
    if (!host.current) return;
    const current = messagesRef.current;
    const liveMessages = current
      ? (Object.fromEntries(
          Object.entries(current).map(([k, v]) =>
            typeof v === "function"
              ? [k, (...args: unknown[]) => (messagesRef.current?.[k as MessageKey] as (...a: unknown[]) => string)(...args)]
              : [k, v],
          ),
        ) as Partial<Messages>)
      : undefined;
    const instance = createPackingBingo(host.current, {
      ...config,
      messages: liveMessages,
      controlled,
      defaultChecked: controlled || latestKey.current === storageKey ? latest.current : defaultChecked,
      onChange: (next) => {
        if (!controlled) latest.current = next;
        callbacks.current.onChange?.(next);
      },
      onBingo: (e) => callbacks.current.onBingo?.(e),
      onPerfect: (e) => callbacks.current.onPerfect?.(e),
    });
    inst.current = instance;
    return () => {
      // Keep the current checks (including ones set through the ref) for the next build, and
      // always record their key, so they can't be carried into another key later.
      if (!controlled) latest.current = instance.getState().checked;
      latestKey.current = storageKey;
      instance.destroy();
      if (inst.current === instance) inst.current = null;
    };
    // `key` captures everything in `config`; callbacks and message functions are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Message functions may close over props or state; redraw the status line when they change.
  useEffect(() => {
    inst.current?.refresh();
  }, [messages]);

  useEffect(() => {
    if (controlled && checked) inst.current?.setChecked(checked, { animate: true });
  }, [controlled, checked]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => inst.current?.reset(),
      setChecked: (next) => inst.current?.setChecked(next, { animate: true }),
      getState: () => inst.current?.getState() ?? null,
    }),
    [],
  );

  return <div ref={host} className={className} style={style} />;
});

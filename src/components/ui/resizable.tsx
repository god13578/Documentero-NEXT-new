"use client";

import * as React from "react";

type Direction = "horizontal" | "vertical";

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
}

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
}

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
  index?: number;
}

interface PanelContextValue {
  direction: Direction;
  sizes: number[];
  minSizes: number[];
  startDrag: (index: number, event: React.PointerEvent<HTMLDivElement>) => void;
}

const PanelGroupContext = React.createContext<PanelContextValue | null>(null);

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const isPanel = (child: React.ReactNode): child is React.ReactElement<ResizablePanelProps> =>
  React.isValidElement(child) && child.type === ResizablePanel;

const isHandle = (child: React.ReactNode): child is React.ReactElement<ResizableHandleProps> =>
  React.isValidElement(child) && child.type === ResizableHandle;

export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ direction = "horizontal", className, children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const mergedRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") ref(node);
      if (ref && typeof ref === "object") (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const [sizes, setSizes] = React.useState<number[]>([]);
    const [minSizes, setMinSizes] = React.useState<number[]>([]);

    React.useEffect(() => {
      const configs: { defaultSize: number; minSize: number }[] = [];
      React.Children.forEach(children, (child) => {
        if (isPanel(child)) {
          configs.push({
            defaultSize: child.props.defaultSize ?? 50,
            minSize: child.props.minSize ?? 10,
          });
        }
      });

      if (configs.length === 0) return;

      const total = configs.reduce((sum, cfg) => sum + cfg.defaultSize, 0);
      const normalized = configs.map((cfg) => (cfg.defaultSize / total) * 100);
      setSizes((prev) => (prev.length ? prev : normalized));
      setMinSizes(configs.map((cfg) => cfg.minSize));
    }, [children]);

    const startDrag = React.useCallback(
      (index: number, event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const container = containerRef.current;
        if (!container || sizes.length < index + 2) return;

        const startPos = direction === "horizontal" ? event.clientX : event.clientY;
        const rect = container.getBoundingClientRect();
        const containerSize = direction === "horizontal" ? rect.width : rect.height;
        const startSizes = [...sizes];

        const cursor = direction === "horizontal" ? "col-resize" : "row-resize";
        document.body.style.cursor = cursor;
        document.body.style.userSelect = "none";

        const onMove = (moveEvent: PointerEvent) => {
          const currentPos = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
          const deltaPercent = ((currentPos - startPos) / containerSize) * 100;

          const totalPair = startSizes[index] + startSizes[index + 1];
          let nextFirst = startSizes[index] + deltaPercent;
          let nextSecond = startSizes[index + 1] - deltaPercent;
          const minFirst = minSizes[index] ?? 5;
          const minSecond = minSizes[index + 1] ?? 5;

          if (nextFirst < minFirst) {
            nextFirst = minFirst;
            nextSecond = totalPair - minFirst;
          }

          if (nextSecond < minSecond) {
            nextSecond = minSecond;
            nextFirst = totalPair - minSecond;
          }

          setSizes((prev) => {
            const updated = [...prev];
            updated[index] = nextFirst;
            updated[index + 1] = nextSecond;
            return updated;
          });
        };

        const onUp = () => {
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      },
      [direction, sizes, minSizes]
    );

    let panelIndex = -1;
    const mappedChildren = React.Children.map(children, (child) => {
      if (isPanel(child)) {
        panelIndex += 1;
        return React.cloneElement(child, {
          panelIndex,
          size: sizes[panelIndex],
          direction,
        } as Partial<ResizablePanelProps> & { panelIndex: number; size: number; direction: Direction });
      }
      if (isHandle(child)) {
        return React.cloneElement(child, { index: panelIndex } as ResizableHandleProps);
      }
      return child;
    });

    return (
      <PanelGroupContext.Provider value={{ direction, sizes, minSizes, startDrag }}>
        <div
          ref={mergedRef}
          className={cx(
            "flex h-full w-full",
            direction === "horizontal" ? "flex-row" : "flex-col",
            className
          )}
          {...props}
        >
          {mappedChildren}
        </div>
      </PanelGroupContext.Provider>
    );
  }
);

ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  ResizablePanelProps & { panelIndex?: number; size?: number; direction?: Direction }
>(({ className, size, direction = "horizontal", style, ...props }, ref) => {
  const panelStyle: React.CSSProperties = {
    flexBasis: size ? `${size}%` : undefined,
    flexGrow: size ? 0 : 1,
    flexShrink: 0,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={cx("overflow-hidden", className)}
      style={panelStyle}
      {...props}
    />
  );
});

ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, index = 0, ...props }, ref) => {
    const ctx = React.useContext(PanelGroupContext);
    const direction = ctx?.direction ?? "horizontal";

    return (
      <div
        ref={ref}
        role="separator"
        className={cx(
          "relative flex items-center justify-center bg-slate-200",
          direction === "horizontal" ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
          className
        )}
        onPointerDown={(event) => ctx?.startDrag(index, event)}
        {...props}
      >
        <div
          className={cx(
            "rounded-full bg-slate-400",
            direction === "horizontal" ? "h-10 w-1" : "h-1 w-10"
          )}
        />
      </div>
    );
  }
);

ResizableHandle.displayName = "ResizableHandle";

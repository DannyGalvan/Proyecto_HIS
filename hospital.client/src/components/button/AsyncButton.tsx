import { Button, Spinner } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";

type HeroButtonProps = ComponentProps<typeof Button>;

interface AsyncButtonProps extends Omit<HeroButtonProps, "isPending" | "isDisabled" | "children"> {
  /** Whether the async operation is in progress. Shows spinner and disables the button. */
  readonly isLoading: boolean;
  /** Button label or content shown when not loading. */
  readonly children: ReactNode;
  /** Optional label shown while loading. Defaults to children. */
  readonly loadingText?: string;
  /**
   * Whether the button should be disabled.
   */
  readonly isDisabled?:  boolean;
}

/**
 * A wrapper around HeroUI's Button that automatically shows a spinner
 * and disables interaction while an async operation is in progress.
 *
 * Usage:
 * ```tsx
 * <AsyncButton isLoading={loading} variant="primary" type="submit">
 *   Guardar
 * </AsyncButton>
 * ```
 */
export function AsyncButton({
  isLoading,
  children,
  loadingText,
  ...rest
}: AsyncButtonProps) {
  return (
    <Button
      {...rest}
      isDisabled={isLoading || rest.isDisabled}
      isPending={isLoading}
    >
      {({ isPending }: { isPending: boolean }) => (
        <>
          {isPending && <Spinner color="current" size="sm" />}
          {isPending && loadingText ? loadingText : children}
        </>
      )}
    </Button>
  );
}

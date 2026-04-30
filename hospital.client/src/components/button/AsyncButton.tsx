import { Button, Spinner } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";

type HeroButtonProps = ComponentProps<typeof Button>;

interface AsyncButtonProps {
  /** Whether the async operation is in progress. Shows spinner and disables the button. */
  readonly isLoading: boolean;
  /** Button label or content shown when not loading. */
  readonly children: ReactNode;
  /** Optional label shown while loading. Defaults to children. */
  readonly loadingText?: string;
  readonly isDisabled?: boolean;
  readonly variant?: HeroButtonProps["variant"];
  readonly size?: HeroButtonProps["size"];
  readonly type?: "button" | "submit" | "reset";
  readonly className?: string;
  readonly onPress?: HeroButtonProps["onPress"];
  readonly onClick?: HeroButtonProps["onClick"];
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
  isDisabled,
  variant,
  size,
  type,
  className,
  onPress,
  onClick,
}: AsyncButtonProps) {
  return (
    <Button
      className={className}
      isDisabled={isLoading || isDisabled}
      isPending={isLoading}
      size={size}
      type={type}
      variant={variant}
      onClick={onClick}
      onPress={onPress}
    >
      {(renderProps: { readonly isPending: boolean }) => (
        <>
          {renderProps.isPending ? <Spinner color="current" size="sm" /> : null}
          {renderProps.isPending && loadingText ? loadingText : children}
        </>
      )}
    </Button>
  );
}

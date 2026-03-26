import * as React from "react";
import { cn } from "@/utils/cn";

/**
 * Interface cho các thuộc tính của component Label.
 * Kế thừa toàn bộ thuộc tính của thẻ label HTML chuẩn.
 */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Component Label: Hiển thị nhãn cho các trường nhập liệu.
 * Sử dụng forwardRef để cho phép truy cập trực tiếp vào phần tử DOM nếu cần.
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        // Các class CSS mặc định cho nhãn (font-size, font-weight, v.v.)
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-50",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };

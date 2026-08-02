"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors={false}
      gap={16}
      toastOptions={{
        classNames: {
          toast: "group toast bg-card border-primary/40 shadow-2xl rounded-2xl p-4 sm:p-6 w-[calc(100vw-2rem)] sm:min-w-[400px] sm:max-w-[600px] max-w-[calc(100vw-2rem)] min-h-[100px] sm:min-h-[120px]",
          title: "text-foreground font-bold text-base sm:text-lg tracking-wide uppercase",
          description: "text-muted-foreground text-sm sm:text-base mt-2 leading-relaxed",
          success: "bg-card border-primary border-2",
          error: "bg-card border-destructive border-2",
          warning: "bg-card border-yellow-500 border-2",
          info: "bg-card border-blue-500 border-2",
          actionButton: "bg-primary text-primary-foreground font-bold uppercase tracking-wide rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base hover:bg-primary/90 transition-colors",
          cancelButton: "bg-muted text-muted-foreground font-bold uppercase tracking-wide rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base hover:bg-muted/80 transition-colors",
          closeButton: "bg-muted/50 border-border hover:bg-muted transition-colors rounded-full",
        },
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
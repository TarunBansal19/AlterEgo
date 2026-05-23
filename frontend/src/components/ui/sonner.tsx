import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-[#0c0c12]/95 !backdrop-blur-xl !border !border-white/10 !text-white !shadow-[0_8px_32px_-8px_rgba(168,85,247,0.4)]",
          description: "group-[.toast]:!text-white/60",
          actionButton: "group-[.toast]:!bg-violet group-[.toast]:!text-white",
          cancelButton: "group-[.toast]:!bg-white/10 group-[.toast]:!text-white/70",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

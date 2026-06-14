import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black">
      <SignUp
        appearance={{
          variables: {
            colorBackground: "#000000",
            colorInputBackground: "#0a0a0a",
            colorInputText: "#ffffff",
            colorText: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorTextOnPrimaryBackground: "#000000",
            colorPrimary: "#ffffff",
            colorDanger: "#f87171",
            colorSuccess: "#4ade80",
            colorWarning: "#facc15",
            colorNeutral: "#ffffff",
            colorShimmer: "#18181b",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
            fontSize: "0.875rem",
          },
          elements: {
            rootBox: "w-full flex justify-center",
            card: [
              "!bg-black",
              "!border !border-zinc-800",
              "!shadow-2xl !shadow-black/80",
              "!rounded-2xl",
            ].join(" "),

            headerTitle: "!text-white !text-xl !font-bold",
            headerSubtitle: "!text-zinc-400 !text-sm",
            logoBox: "hidden",

            socialButtonsBlockButton: [
              "!bg-zinc-900 !border !border-zinc-700",
              "!text-white !text-sm !font-medium",
              "hover:!bg-zinc-800 hover:!border-zinc-600",
              "!transition-colors !duration-150 !rounded-lg",
            ].join(" "),
            socialButtonsBlockButtonText: "!text-white !font-medium",
            socialButtonsBlockButtonArrow: "!text-zinc-400",

            badge: "!bg-zinc-800 !text-zinc-300 !border !border-zinc-700 !text-xs",

            dividerLine: "!bg-zinc-800",
            dividerText: "!text-zinc-500 !text-xs",

            formFieldLabel: "!text-zinc-300 !text-xs !font-medium",

            formFieldInput: [
              "!bg-zinc-950 !border !border-zinc-700",
              "!text-white !placeholder-zinc-600",
              "focus:!border-zinc-500 focus:!ring-1 focus:!ring-zinc-500",
              "!rounded-lg !text-sm",
            ].join(" "),

            formFieldErrorText: "!text-red-400 !text-xs",
            formFieldHintText: "!text-zinc-500 !text-xs",
            formFieldWarningText: "!text-yellow-400 !text-xs",
            formFieldSuccessText: "!text-green-400 !text-xs",

            formButtonPrimary: [
              "!bg-white !text-black !text-sm !font-semibold",
              "hover:!bg-zinc-200 active:!scale-[0.99]",
              "!transition-all !duration-200 !rounded-lg",
              "!shadow-sm",
            ].join(" "),

            footer: [
              "!bg-black",
              "!border-t !border-zinc-800",
              "!rounded-b-2xl",
            ].join(" "),
            footerAction: "!bg-transparent",
            footerActionText: "!text-zinc-400 !text-sm",
            footerActionLink: [
              "!text-white !font-semibold !text-sm",
              "hover:!text-zinc-300",
              "!underline !underline-offset-2",
              "!transition-colors !duration-150",
            ].join(" "),

            formFieldAction: [
              "!text-zinc-400 !text-xs",
              "hover:!text-white !transition-colors !duration-150",
            ].join(" "),

            identityPreview: "!bg-zinc-900 !border !border-zinc-800 !rounded-lg",
            identityPreviewText: "!text-zinc-300 !text-sm",
            identityPreviewEditButton: "!text-white hover:!text-zinc-300",
            identityPreviewEditButtonIcon: "!text-zinc-400",

            alert: "!bg-red-950/30 !border !border-red-500/20 !rounded-lg",
            alertText: "!text-red-400 !text-sm",
            alertIcon: "!text-red-400",

            otpCodeFieldInput: [
              "!bg-zinc-950 !border !border-zinc-700",
              "!text-white !text-lg !font-bold",
              "focus:!border-zinc-500 focus:!ring-1 focus:!ring-zinc-500",
              "!rounded-lg",
            ].join(" "),

            navbarButton: "!text-zinc-400 hover:!text-white",
            navbarButtonIcon: "!text-zinc-500",

            footerPages: "hidden",
            footerPagesLink: "hidden",

            selectButton: [
              "!bg-zinc-950 !border !border-zinc-700",
              "!text-white !rounded-lg",
            ].join(" "),
            selectOptionsContainer: [
              "!bg-zinc-900 !border !border-zinc-700",
              "!rounded-lg !shadow-xl",
            ].join(" "),
            selectOption: "!text-zinc-300 hover:!bg-zinc-800 hover:!text-white",

            phoneInputBox: [
              "!bg-zinc-950 !border !border-zinc-700",
              "!text-white !rounded-lg",
            ].join(" "),

            formFieldInputShowPasswordButton: "!text-zinc-500 hover:!text-white",
          },
        }}
      />
    </div>
  );
}
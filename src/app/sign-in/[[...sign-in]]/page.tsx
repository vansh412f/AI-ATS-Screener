import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black">
      <SignIn
        appearance={{
  variables: {
    // These CSS custom properties override Clerk's internal styles
    // at the token level — they cascade with higher priority than
    // any Tailwind class we'd put in `elements`.
    colorBackground: "#000000",
    colorInputBackground: "#0a0a0a",
    colorInputText: "#ffffff",
    colorText: "#f4f4f5",           // zinc-100
    colorTextSecondary: "#a1a1aa",  // zinc-400
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
    // Root card
    rootBox: "w-full flex justify-center",
    card: [
      "!bg-black",
      "!border !border-zinc-800",
      "!shadow-2xl !shadow-black/80",
      "!rounded-2xl",
    ].join(" "),

    // Header
    headerTitle: "!text-white !text-xl !font-bold",
    headerSubtitle: "!text-zinc-400 !text-sm",
    logoBox: "hidden",

    // Social buttons (Google, GitHub, etc.)
    socialButtonsBlockButton: [
      "!bg-zinc-900 !border !border-zinc-700",
      "!text-white !text-sm !font-medium",
      "hover:!bg-zinc-800 hover:!border-zinc-600",
      "!transition-colors !duration-150 !rounded-lg",
    ].join(" "),
    socialButtonsBlockButtonText: "!text-white !font-medium",
    socialButtonsBlockButtonArrow: "!text-zinc-400",
    badge: "!bg-transparent !text-yellow-400 !border-none !text-xs !font-medium",
    // Divider ("or")
    dividerLine: "!bg-zinc-800",
    dividerText: "!text-zinc-500 !text-xs",

    // Form labels
    formFieldLabel: "!text-zinc-300 !text-xs !font-medium",

    // Inputs
    formFieldInput: [
      "!bg-zinc-950 !border !border-zinc-700",
      "!text-white !placeholder-zinc-600",
      "focus:!border-zinc-500 focus:!ring-1 focus:!ring-zinc-500",
      "!rounded-lg !text-sm",
    ].join(" "),

    // Error / hint text under fields
    formFieldErrorText: "!text-red-400 !text-xs",
    formFieldHintText: "!text-zinc-500 !text-xs",
    formFieldWarningText: "!text-yellow-400 !text-xs",
    formFieldSuccessText: "!text-green-400 !text-xs",

    // Primary button (Continue / Sign in)
    formButtonPrimary: [
      "!bg-white !text-black !text-sm !font-semibold",
      "hover:!bg-zinc-200 active:!scale-[0.99]",
      "!transition-all !duration-200 !rounded-lg",
      "!shadow-sm",
    ].join(" "),

    // Footer — "Don't have an account? Sign up" / vice versa
    // This is the section that was invisible on black.
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

    // Forgot password / form field action links
    formFieldAction: [
      "!text-zinc-400 !text-xs",
      "hover:!text-white !transition-colors !duration-150",
    ].join(" "),

    // Identity preview (shown in multi-step flows)
    identityPreview: "!bg-zinc-900 !border !border-zinc-800 !rounded-lg",
    identityPreviewText: "!text-zinc-300 !text-sm",
    identityPreviewEditButton: "!text-white hover:!text-zinc-300",
    identityPreviewEditButtonIcon: "!text-zinc-400",

    // Alert/error boxes (wrong password, rate limit, etc.)
    alert: "!bg-red-950/30 !border !border-red-500/20 !rounded-lg",
    alertText: "!text-red-400 !text-sm",
    alertIcon: "!text-red-400",

    // The OTP / verification code input
    otpCodeFieldInput: [
      "!bg-zinc-950 !border !border-zinc-700",
      "!text-white !text-lg !font-bold",
      "focus:!border-zinc-500 focus:!ring-1 focus:!ring-zinc-500",
      "!rounded-lg",
    ].join(" "),

    // Nav links Clerk uses internally (back button, etc.)
    navbarButton: "!text-zinc-400 hover:!text-white",
    navbarButtonIcon: "!text-zinc-500",

    // "Secured by Clerk" badge
    footerPages: "hidden",
    footerPagesLink: "hidden",

    // Badge shown for unverified email
    badge: "!bg-zinc-800 !text-zinc-300 !border !border-zinc-700 !text-xs",

    // Select dropdowns (country code, etc.)
    selectButton: [
      "!bg-zinc-950 !border !border-zinc-700",
      "!text-white !rounded-lg",
    ].join(" "),
    selectOptionsContainer: [
      "!bg-zinc-900 !border !border-zinc-700",
      "!rounded-lg !shadow-xl",
    ].join(" "),
    selectOption: "!text-zinc-300 hover:!bg-zinc-800 hover:!text-white",

    // Phone number input
    phoneInputBox: [
      "!bg-zinc-950 !border !border-zinc-700",
      "!text-white !rounded-lg",
    ].join(" "),

    // Active/focused states on interactive elements
    formFieldInputShowPasswordButton: "!text-zinc-500 hover:!text-white",
  },
}}
      />
    </div>
  );
}
"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";

type EmailFieldStatus = "idle" | "sending" | "sent" | "error";

type EmailFieldProps = {
  placeholder?: string;
  errorMessage?: string;
  onSubmit?: (email: string) => void | Promise<void>;
};

export function EmailField({
  placeholder = "Enter your email",
  errorMessage = "Email is incorrect.",
  onSubmit,
}: EmailFieldProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<EmailFieldStatus>("idle");

  const submitIcon =
    status === "sent"
      ? "/icons/check-line.svg"
      : status === "sending"
        ? "/icons/loading-line.svg"
        : status === "error"
          ? "/icons/arrow-right-2-line-muted.svg"
          : "/icons/arrow-right-2-line.svg";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    await onSubmit?.(value);
    setStatus("sent");
  }

  return (
    <form className="flex w-full max-w-[300px] flex-col gap-1" onSubmit={handleSubmit} noValidate>
      <div
        className={cn(
          "relative flex h-12 items-center overflow-clip rounded-pill border-2 border-neutrals-6 focus-within:border-primary-1 dark:border-neutrals-3 dark:focus-within:border-primary-1",
          status === "sent" && "border-primary-4 dark:border-primary-4",
          status === "error" && "border-primary-3 bg-neutrals-8 dark:border-primary-3 dark:bg-neutrals-3",
        )}
      >
        <input
          className={cn(
            "h-full min-w-0 flex-1 border-none bg-transparent py-0 pl-3.5 pr-14 font-body text-caption text-neutrals-2 outline-none placeholder:text-neutrals-4 dark:text-neutrals-8",
            status === "error" && "pr-[88px]",
          )}
          type="email"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value);
            if (status === "error" || status === "sent") {
              setStatus("idle");
            }
          }}
          disabled={status === "sending" || status === "sent"}
          aria-invalid={status === "error" || undefined}
        />
        {status === "error" ? (
          <button
            className="absolute right-[52px] top-1/2 flex -translate-y-1/2 border-none bg-transparent p-0"
            type="button"
            aria-label="Clear"
            onClick={() => {
              setValue("");
              setStatus("idle");
            }}
          >
            <Icon src="/icons/remove-16.svg" size={16} />
          </button>
        ) : null}
        <button
          className={cn(
            "absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[100px] border-none p-1",
            status === "sent"
              ? "bg-primary-4"
              : status === "error"
                ? "cursor-default bg-neutrals-5"
                : "bg-primary-1",
          )}
          type="submit"
          disabled={status === "sending" || status === "sent" || status === "error"}
          aria-label="Submit email"
        >
          <span className={cn(status === "sending" && "animate-spin")}>
            <Icon src={submitIcon} size={24} />
          </span>
        </button>
      </div>
      {status === "error" ? (
        <p className="m-0 rounded-[100px] bg-neutrals-8 px-4 py-[5px] font-body text-caption-2 font-bold text-primary-3">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}

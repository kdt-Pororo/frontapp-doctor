"use client";

import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { ArrowLeft, Inbox, X } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-[#DCE5E9] bg-white px-3.5 py-3 text-sm text-[#203B48] outline-none placeholder:text-[#A1AFB7] focus:border-[#188D88] focus:ring-2 focus:ring-[#188D88]/10 disabled:bg-[#F3F6F7]";
export const primaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#168B86] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#10716D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168B86] disabled:pointer-events-none disabled:opacity-40";
const secondaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DBE4E8] bg-white px-4 text-sm font-medium text-[#49616E] hover:bg-[#F6F9FA] disabled:pointer-events-none disabled:opacity-40";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary: primaryClass,
    secondary: secondaryClass,
    danger:
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FFF0ED] px-4 text-sm font-semibold text-[#BF5948] hover:bg-[#FBE3DD] disabled:pointer-events-none disabled:opacity-40",
    ghost:
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-[#63808C] hover:bg-[#EAF1F3]",
  };
  return (
    <button
      type="button"
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link href={href} className={secondary ? secondaryClass : primaryClass}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "amber" | "neutral" | "purple" | "red";
}) {
  const colors = {
    teal: "bg-[#E1F3EE] text-[#187E6E]",
    amber: "bg-[#FFF2DB] text-[#AB7828]",
    neutral: "bg-[#EDF1F4] text-[#74838F]",
    purple: "bg-[#F0ECFC] text-[#7864BC]",
    red: "bg-[#FCEDEA] text-[#B85D51]",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-xs font-semibold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
  backHref,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mb-7">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[#81949E] hover:text-[#168B86]"
        >
          <ArrowLeft size={14} />
          산모 목록으로
        </Link>
      )}
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1C3745]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-[#83959F]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex shrink-0 gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#E1E8EC] bg-white ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 px-6 pb-0 pt-6">
          <div>
            {title && <h2 className="font-bold text-[#294451]">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs leading-5 text-[#8A9CA5]">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold text-[#6B8290]"
      >
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-describedby"?: string;
            }>,
            { id, "aria-describedby": hint ? hintId : undefined },
          )
        : children}
      {hint && (
        <span
          id={hintId}
          className="mt-1.5 block text-xs leading-5 text-[#91A0A8]"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 rounded-2xl bg-[#F0F6F6] p-4 text-[#80A8AA]">
        <Inbox size={25} />
      </span>
      <h3 className="font-semibold text-[#496370]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[#8B9CA5]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      className="m-auto  max-w-[90vw] rounded-2xl border-0 p-0 text-[#294451] shadow-2xl backdrop:bg-[#0F293B]/40"
    >
      <div className="flex items-center justify-between border-b border-[#E8EEF1] px-7 py-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button variant="ghost" aria-label="창 닫기" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      <div className="p-7">{children}</div>
    </dialog>
  );
}

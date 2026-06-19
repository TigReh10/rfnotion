"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, Trash2, Loader2, Copy, Check } from "lucide-react";

type Banner = { kind: "ok" | "error"; text: string } | null;

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Something went wrong");
  return data;
}

const inputClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const cardClass = "rounded-2xl border bg-card p-6";

function Message({ banner }: { banner: Banner }) {
  if (!banner) return null;
  const cls =
    banner.kind === "ok"
      ? "bg-green-500/10 text-green-700 dark:text-green-400"
      : "bg-destructive/10 text-destructive";
  return <p className={`rounded-md px-3 py-2 text-sm ${cls}`}>{banner.text}</p>;
}

export function SettingsClient({
  email,
  planName,
  planStatus,
  twoFactorEnabled,
  canChangePassword,
}: {
  email: string;
  planName: string;
  planStatus: string | null;
  twoFactorEnabled: boolean;
  canChangePassword: boolean;
}) {
  const router = useRouter();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwBanner, setPwBanner] = useState<Banner>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA state
  const [enabled, setEnabled] = useState(twoFactorEnabled);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [twoFaBanner, setTwoFaBanner] = useState<Banner>(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete state
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBanner, setDeleteBanner] = useState<Banner>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwBanner(null);
    if (newPassword.length < 8) {
      setPwBanner({ kind: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwBanner({ kind: "error", text: "New password and confirmation do not match." });
      return;
    }
    setPwLoading(true);
    try {
      await api("/api/account/password", "POST", { currentPassword, newPassword });
      setPwBanner({ kind: "ok", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwBanner({ kind: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setPwLoading(false);
    }
  }

  async function startSetup() {
    setTwoFaBanner(null);
    setTwoFaLoading(true);
    try {
      const data = await api("/api/account/2fa", "POST", { action: "setup" });
      setSecret(data.secret as string);
      setOtpauthUri(data.otpauthUri as string);
    } catch (err) {
      setTwoFaBanner({ kind: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaBanner(null);
    setTwoFaLoading(true);
    try {
      await api("/api/account/2fa", "POST", { action: "enable", token: code });
      setEnabled(true);
      setSecret(null);
      setOtpauthUri(null);
      setCode("");
      setTwoFaBanner({ kind: "ok", text: "Two-factor authentication is now on." });
    } catch (err) {
      setTwoFaBanner({ kind: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function disable2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaBanner(null);
    setTwoFaLoading(true);
    try {
      await api("/api/account/2fa", "POST", { action: "disable", token: code });
      setEnabled(false);
      setCode("");
      setTwoFaBanner({ kind: "ok", text: "Two-factor authentication is now off." });
    } catch (err) {
      setTwoFaBanner({ kind: "error", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setTwoFaLoading(false);
    }
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteBanner(null);
    if (!confirmDelete) {
      setDeleteBanner({ kind: "error", text: "Tick the confirmation box first." });
      return;
    }
    setDeleteLoading(true);
    try {
      await api("/api/account", "DELETE", { password: deletePassword || undefined });
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeleteBanner({ kind: "error", text: err instanceof Error ? err.message : "Failed" });
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Account */}
      <section className={cardClass}>
        <h3 className="font-semibold">Account</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="flex items-center gap-2 font-medium">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {planName}
              </span>
              {planStatus ? (
                <span className="text-xs text-muted-foreground">{planStatus.toLowerCase()}</span>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>

      {/* Password */}
      {canChangePassword ? (
        <section className={cardClass}>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Change password</h3>
          </div>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
            <Message banner={pwBanner} />
            <button
              type="submit"
              disabled={pwLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update password
            </button>
          </form>
        </section>
      ) : (
        <section className={cardClass}>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Password</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            You signed in with Google, so there is no password to manage here.
          </p>
        </section>
      )}

      {/* Two-factor */}
      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Two-factor authentication</h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              enabled ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"
            }`}
          >
            {enabled ? "On" : "Off"}
          </span>
        </div>

        {!enabled && !secret ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security using an authenticator app like Google Authenticator or Authy.
            </p>
            <Message banner={twoFaBanner} />
            <button
              onClick={startSetup}
              disabled={twoFaLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Set up two-factor
            </button>
          </div>
        ) : null}

        {!enabled && secret ? (
          <form onSubmit={confirmEnable} className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Add this secret key to your authenticator app, then enter the 6-digit code it shows.
            </p>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <code className="flex-1 break-all text-sm">{secret}</code>
              <button
                type="button"
                onClick={copySecret}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Copy secret"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {otpauthUri ? (
              <a
                href={otpauthUri}
                className="inline-block text-xs font-medium text-primary hover:underline"
              >
                Open in authenticator app
              </a>
            ) : null}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
            />
            <Message banner={twoFaBanner} />
            <button
              type="submit"
              disabled={twoFaLoading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify and enable
            </button>
          </form>
        ) : null}

        {enabled ? (
          <form onSubmit={disable2fa} className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Two-factor is protecting your account. Enter a current code to turn it off.
            </p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
            />
            <Message banner={twoFaBanner} />
            <button
              type="submit"
              disabled={twoFaLoading}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {twoFaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Turn off two-factor
            </button>
          </form>
        ) : null}
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <h3 className="font-semibold text-destructive">Delete account</h3>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          This permanently deletes your account and all associated data — resumes, analyses, cover letters and more. This cannot be undone.
        </p>
        <form onSubmit={deleteAccount} className="mt-4 space-y-3">
          {canChangePassword ? (
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Confirm your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={inputClass}
            />
          ) : null}
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="mt-0.5"
            />
            I understand this action is permanent.
          </label>
          <Message banner={deleteBanner} />
          <button
            type="submit"
            disabled={deleteLoading}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
          >
            {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete my account
          </button>
        </form>
      </section>
    </div>
  );
}

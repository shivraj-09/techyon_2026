"use client";

import { FormEvent, MouseEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

type RoleId = "student" | "parent" | "teacher" | "admin" | "counsellor";

interface RoleOption {
  id: RoleId;
  title: string;
  subtitle: string;
  sampleEmail: string;
}

const ROLES: RoleOption[] = [
  {
    id: "student",
    title: "Student",
    subtitle: "Student Voice",
    sampleEmail: "student@institution.in",
  },
  {
    id: "parent",
    title: "Parent",
    subtitle: "School",
    sampleEmail: "parent@institution.in",
  },
  {
    id: "teacher",
    title: "Teacher",
    subtitle: "Faculty",
    sampleEmail: "teacher@institution.in",
  },
  {
    id: "counsellor",
    title: "Counsellor",
    subtitle: "Student Support",
    sampleEmail: "counsellor@institution.in",
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Management",
    sampleEmail: "admin@institution.in",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleId | null>("parent");
  const [email, setEmail] = useState("parent@institution.in");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  function handleRoleSelect(role: RoleOption) {
    setSelectedRole(role.id);
    setEmail(role.sampleEmail);
  }

  const activeRole = ROLES.find((r) => r.id === selectedRole);

  // [DISCONNECTED ENDPOINTS] Previously connected to:
  // 1. Supabase Auth Sign In: POST /auth/v1/token?grant_type=password (via supabase.auth.signInWithPassword)
  // 2. FastAPI Verify User:    GET /api/v1/auth/me
  // 3. FastAPI Memberships:    GET /api/v1/auth/memberships
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (!selectedRole) {
        throw new Error("Choose a role to continue.");
      }
      const supabase = createClient();
      const cleanInput = email.trim();
      const credentials = cleanInput.includes("@")
        ? { email: cleanInput, password }
        : { phone: cleanInput, password };
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword(credentials);
      if (signInError) throw signInError;
      const accessToken = authData.session?.access_token;
      if (!accessToken) throw new Error("Sign-in did not return an access token.");

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
      const api = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
      if (selectedRole === "student") {
        const accessResponse = await fetch(`${api}/api/v1/auth/student-voice-access`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        if (!accessResponse.ok) throw new Error("Could not verify Student Voice access.");
        const accessData = await accessResponse.json();
        const link = Array.isArray(accessData.access) ? accessData.access[0] : null;
        if (!link?.school_id) {
          await supabase.auth.signOut();
          throw new Error("This account is not linked to Student Voice. Ask your school administrator to enable access.");
        }
        sessionStorage.setItem("edusync_demo_email", authData.user.email || cleanInput);
        sessionStorage.setItem("edusync_demo_role", "student");
        sessionStorage.setItem("edusync_active_school_id", link.school_id);
        router.replace("/student-voice");
        router.refresh();
        return;
      }

      const membershipResponse = await fetch(`${api}/api/v1/auth/memberships`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!membershipResponse.ok) {
        throw new Error(membershipResponse.status === 401
          ? "Your session could not be verified. Please sign in again."
          : "Could not verify your school access. Please try again.");
      }
      const membershipData = await membershipResponse.json();
      if (membershipData?.success !== true || !Array.isArray(membershipData.memberships)) {
        throw new Error("The school access service returned an invalid response.");
      }
      const membership = membershipData.memberships.find(
        (item: { role: string; status: string; school_id: string }) =>
          item.role === selectedRole && item.status === "active" && item.school_id,
      );
      if (!membership) {
        await supabase.auth.signOut();
        throw new Error(`This account does not have an active ${selectedRole} membership. Select the role assigned by your school.`);
      }

      const userEmail = authData.user.email || cleanInput;
      sessionStorage.setItem("edusync_demo_email", userEmail);
      sessionStorage.setItem("edusync_demo_role", selectedRole);
      sessionStorage.setItem("edusync_active_school_id", membership.school_id);
      const destination = selectedRole === "counsellor"
        ? "/counsellor/dashboard"
        : selectedRole === "teacher"
          ? "/teacher/dashboard"
          : selectedRole === "parent"
            ? "/parent/dashboard"
            : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Enter your registered email address to reset your password.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setSuccess("Password reset instructions have been sent if the account exists.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request password reset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <nav className="login-nav">
        <Link href="/" className="login-back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Home
        </Link>
        <ThemeSwitcher variant="compact" />
      </nav>

      <main className="login-main">
        <div className="login-card-wrapper">
          {/* Header & Logo */}
          <header className="login-header">
            <div className="login-logo-badge">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="19" cy="5" r="2" />
                <circle cx="5" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <line x1="12" y1="9" x2="12" y2="3" />
                <circle cx="12" cy="3" r="1" fill="currentColor" />
                <path d="m14 10 3.5-3.5" />
                <path d="m10 10-3.5-3.5" />
                <path d="m10 14-3.5 3.5" />
                <path d="m14 14 3.5 3.5" />
              </svg>
            </div>
            <h1 className="login-title">EduSync</h1>
            <p className="login-subtitle">
              One institution. One connected ecosystem.
            </p>
          </header>

          {/* Role Selection */}
          <section className="role-section" aria-label="Select Role">
            <div className="role-section-header">
              <span className="role-section-title">Select Role</span>   
            </div>

            <div className="role-grid">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-card-btn ${isSelected ? "active" : ""}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="role-icon-box">
                      {role.id === "student" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      )}
                      {role.id === "parent" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      )}
                      {role.id === "teacher" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="12" cy="10" r="3" />
                          <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                      {role.id === "admin" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          <circle cx="12" cy="11" r="1.5" />
                          <path d="M12 12.5V15" />
                        </svg>
                      )}
                    </div>
                    <div className="role-card-text">
                      <span className="role-card-name">{role.title}</span>
                      <span className="role-card-sub">{role.subtitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sign In Card */}
          <div className="login-form-card">
            <h2 className="login-form-title">Sign In</h2>

            <form onSubmit={submit}>
              <div className="login-field-group">
                <label className="login-field-label">
                  Email or Mobile Number (+91)
                </label>
                <div className="login-input-container">
                  <span className="login-input-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="login-input"
                    autoComplete="username email"
                    placeholder={
                      activeRole
                        ? `e.g. ${activeRole.sampleEmail} or 9823012345`
                        : "e.g. 9823012345 or user@institution.in"
                    }
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="login-field-group">
                <label className="login-field-label">Password</label>
                <div className="login-input-container">
                  <span className="login-input-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        width="18"
                        height="11"
                        x="3"
                        y="11"
                        rx="2"
                        ry="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    // [DISCONNECTED FOR UI PREVIEW] Removed `required` so you can click Sign In directly without entering a password
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    className="login-checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                  />
                  Remember this device
                </label>
                <a
                  href="#forgot"
                  className="login-forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </a>
              </div>

              {error && (
                <div className="login-error-alert" role="alert">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="login-success-alert" role="status">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={busy}
              >
                {busy ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign In to EduSync
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

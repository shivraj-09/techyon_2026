import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="mark">E</span>EduSync
        </div>
        <Link href="/">← Home</Link>
      </header>

      <div className="auth card" style={{ textAlign: "center" }}>
        <span
          className="pill"
          style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}
        >
          404 NOT FOUND
        </span>

        <div
          style={{
            margin: "20px auto 14px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#f0f9ff",
            border: "1px solid #e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0284c7",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <h1 style={{ margin: "0 0 10px 0", fontSize: "24px", color: "#0f172a" }}>
          Page not found
        </h1>
        <p className="muted" style={{ margin: "0 0 24px 0" }}>
          The page you are looking for doesn’t exist, has been removed, or is
          temporarily unavailable.
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/" style={{ flex: 1 }}>
            <button
              type="button"
              className="btn"
              style={{ width: "100%" }}
            >
              Return Home
            </button>
          </Link>
          <Link href="/login" style={{ flex: 1 }}>
            <button
              type="button"
              className="btn secondary"
              style={{ width: "100%" }}
            >
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}


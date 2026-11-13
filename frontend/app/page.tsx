import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

const PORTAL_CAPABILITIES: Array<{
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: IconName;
}> = [
  {
    title: "School Administration",
    description:
      "Manage admissions, student directories, class allocations, daily attendance, fee schedules, and school-wide announcements from one hub.",
    href: "/login",
    actionLabel: "Admin Sign In",
    icon: "layout-dashboard",
  },
  {
    title: "Teacher Workspace",
    description:
      "Record section attendance quickly, inspect student academic snapshots, follow announcements, and refer students to counselling when needed.",
    href: "/login",
    actionLabel: "Teacher Sign In",
    icon: "book-open",
  },
  {
    title: "Parent & Guardian Portal",
    description:
      "Track child attendance records, review term fee invoices and payment receipts, and receive school circulars directly.",
    href: "/login",
    actionLabel: "Parent Sign In",
    icon: "users",
  },
  {
    title: "Counsellor & Student Voice",
    description:
      "Coordinate student referrals, confidential counselling sessions, and pseudonymous student support conversations safely.",
    href: "/student/voice",
    actionLabel: "Open Student Voice",
    icon: "shield",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F7FA", color: "#212529" }}>
      <header className="es-public-header">
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "19px",
              letterSpacing: "-0.02em",
            }}
          >
            <span
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "#4F9CF9",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="brand-hub" size={18} />
            </span>
            <span>EduSync</span>
          </Link>

          <nav
            aria-label="Primary actions"
            style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}
          >
            <Link
              href="/student/voice"
              className="es-btn es-btn-sm"
              style={{
                backgroundColor: "#FFE492",
                color: "#043873",
                fontWeight: 600,
                padding: "0 14px",
                height: "36px",
              }}
            >
              Student Voice
            </Link>
            <Link
              href="/login"
              className="es-btn es-btn-sm"
              style={{
                backgroundColor: "#4F9CF9",
                color: "#FFFFFF",
                fontWeight: 600,
                padding: "0 16px",
                height: "36px",
              }}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Whitepace Deep Navy Hero Section */}
        <section
          style={{
            backgroundColor: "#043873",
            color: "#FFFFFF",
            padding: "64px 24px 72px",
            borderBottom: "1px solid #012B5B",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              alignItems: "center",
              gap: "48px",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(167, 206, 252, 0.14)",
                  border: "1px solid rgba(167, 206, 252, 0.35)",
                  color: "#A7CEFC",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                Unified School Operating System
              </span>

              <h1
                style={{
                  margin: "0 0 18px",
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  fontWeight: 700,
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                  color: "#FFFFFF",
                }}
              >
                One calm workspace for school operations and student care
              </h1>

              <p
                style={{
                  margin: "0 0 28px",
                  fontSize: "17px",
                  lineHeight: 1.65,
                  color: "#DCEBFF",
                  maxWidth: "560px",
                }}
              >
                EduSync brings academics, attendance, fee collections, family
                communication, and confidential counselling together with
                role-based workspaces built for daily clarity.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <Link
                  href="/login"
                  className="es-btn es-btn-lg"
                  style={{
                    backgroundColor: "#4F9CF9",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    padding: "0 22px",
                    height: "46px",
                  }}
                >
                  Open School Portal
                  <Icon name="arrow-right" size={16} />
                </Link>
                <Link
                  href="/student/voice"
                  className="es-btn es-btn-lg"
                  style={{
                    backgroundColor: "#FFE492",
                    color: "#043873",
                    fontWeight: 600,
                    padding: "0 20px",
                    height: "46px",
                  }}
                >
                  Launch Student Voice
                </Link>
              </div>
            </div>

            {/* Clean Whitepace Structured Workspace Illustration Card */}
            <div
              style={{
                backgroundColor: "#012B5B",
                border: "1px solid rgba(167, 206, 252, 0.25)",
                borderRadius: "14px",
                padding: "22px",
                boxShadow: "0 24px 48px -12px rgba(1, 20, 44, 0.45)",
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "14px",
                  marginBottom: "16px",
                  borderBottom: "1px solid rgba(167, 206, 252, 0.16)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#A7CEFC" }}>
                  Academic Term Overview
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#043873",
                    backgroundColor: "#FFE492",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                  }}
                >
                  5 Active Roles
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Daily Attendance", value: "95.4%", note: "Tracked per section" },
                  { label: "Fee Collections", value: "On Schedule", note: "Invoices & receipts" },
                  { label: "Parent Notices", value: "Instant", note: "Targeted by grade" },
                  { label: "Wellbeing Care", value: "Private", note: "Pseudonymous channel" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(167, 206, 252, 0.16)",
                      borderRadius: "10px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#A7CEFC", marginBottom: "6px" }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#C6DEFD", marginTop: "4px" }}>
                      {stat.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Clean White Role Capabilities Section */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "56px 24px 72px" }}>
          <div style={{ maxWidth: "640px", marginBottom: "32px" }}>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#043873",
              }}
            >
              Designed for every role in your institution
            </h2>
            <p style={{ margin: 0, fontSize: "15.5px", lineHeight: 1.6, color: "#4F5660" }}>
              Select your portal to enter a tailored workspace with clear permissions and responsive workflows.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))",
              gap: "20px",
            }}
          >
            {PORTAL_CAPABILITIES.map((item) => (
              <div
                key={item.title}
                className="es-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "24px",
                  gap: "18px",
                }}
              >
                <div>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      backgroundColor: "#EAF4FF",
                      color: "#043873",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <Icon name={item.icon} size={20} />
                  </div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#212529",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "#4F5660",
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div>
                  <Link
                    href={item.href}
                    className="es-btn es-btn-secondary es-btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {item.actionLabel}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Building2,
  Search,
  RefreshCw,
  BrainCircuit,
  ShieldCheck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  X,
  CheckCircle2,
  MapPin,
  Globe,
  Hash,
  Radio,
  Sparkles,
  Database,
  Activity,
} from "lucide-react";

// ======================================================
// API
// ======================================================

const API_BASE = "https://signalpost-16ud.onrender.com/api";

// ======================================================
// COLORS
// ======================================================

const colors = {
  navy: "#172554",
  navyDark: "#0F172A",

  blue: "#2563EB",
  blueLight: "#EFF6FF",

  pink: "#EC4899",
  pinkDark: "#DB2777",
  pinkLight: "#FCE7F3",

  purple: "#7C3AED",
  purpleLight: "#F5F3FF",

  green: "#059669",
  greenLight: "#ECFDF5",

  amber: "#D97706",
  amberLight: "#FFFBEB",

  red: "#DC2626",
  redLight: "#FEF2F2",

  background: "#F8FAFC",
  border: "#E2E8F0",

  text: "#0F172A",
  textSecondary: "#64748B",
  textLight: "#94A3B8",

  sidebar: "#0B1220",
  sidebarText: "#E2E8F0",
  sidebarMuted: "#94A3B8",
};

// ======================================================
// APP
// ======================================================

function App() {
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(null);
  const [verifying, setVerifying] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCompany, setSelectedCompany] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // ======================================================
  // GET COMPANIES
  // ======================================================

  const getCompanies = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/companies`);

      setCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch companies:", error);

      alert("Failed to load companies. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    getCompanies();
  }, []);

  // ======================================================
  // RESEARCH COMPANY
  // ======================================================

  const researchCompany = async (orgNumber) => {
    try {
      setResearching(orgNumber);

      const response = await axios.post(
        `${API_BASE}/research/${orgNumber}?refresh=true`
      );

      if (response.data?.success) {
        await getCompanies();

        // Open latest company result
        if (response.data.company) {
          setSelectedCompany(response.data.company);
        }
      }
    } catch (error) {
      console.error("Research failed:", error);

      alert(
        error.response?.data?.message ||
          "Company research failed. Please try again."
      );
    } finally {
      setResearching(null);
    }
  };

  // ======================================================
  // VERIFY COMPANY
  // ======================================================

  const verifyCompany = async (companyId) => {
    try {
      setVerifying(companyId);

      const response = await axios.post(
        `${API_BASE}/verification/${companyId}/verify`
      );

      if (response.data?.success) {
        await getCompanies();

        setSelectedCompany((previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            verification: response.data.verification,
          };
        });
      }
    } catch (error) {
      console.error("Verification failed:", error);

      alert(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setVerifying(null);
    }
  };

  // ======================================================
  // FILTER COMPANIES
  // ======================================================

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((company) => {
        return (
          company.name?.toLowerCase().includes(search) ||
          company.companyNumber?.toLowerCase().includes(search) ||
          company.organizationForm?.toLowerCase().includes(search)
        );
      });
    }

    // Status filter
    if (statusFilter === "researched") {
      result = result.filter(
        (company) =>
          company.researchStatus === "completed" ||
          company.aiAnalysis?.summary
      );
    }

    if (statusFilter === "verified") {
      result = result.filter(
        (company) => company.verification?.verified === true
      );
    }

    if (statusFilter === "pending") {
      result = result.filter(
        (company) =>
          !company.researchStatus ||
          company.researchStatus === "pending" ||
          company.researchStatus === "failed"
      );
    }

    return result;
  }, [companies, searchTerm, statusFilter]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.ceil(
    filteredCompanies.length / ITEMS_PER_PAGE
  );

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredCompanies.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredCompanies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalCompanies = companies.length;

  const researchedCompanies = companies.filter(
    (company) =>
      company.researchStatus === "completed" ||
      company.aiAnalysis?.summary
  ).length;

  const verifiedCompanies = companies.filter(
    (company) => company.verification?.verified === true
  ).length;

  const pendingCompanies = totalCompanies - researchedCompanies;

  // ======================================================
  // STATUS BADGE
  // ======================================================

  const StatusBadge = ({ company }) => {
    if (company.verification?.verified) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 9px",
            borderRadius: "999px",
            background: colors.greenLight,
            color: colors.green,
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <CheckCircle2 size={13} />
          Verified
        </span>
      );
    }

    if (
      company.researchStatus === "completed" ||
      company.aiAnalysis?.summary
    ) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 9px",
            borderRadius: "999px",
            background: colors.purpleLight,
            color: colors.purple,
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <BrainCircuit size={13} />
          Researched
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "5px 9px",
          borderRadius: "999px",
          background: colors.amberLight,
          color: colors.amber,
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        <Clock3 size={13} />
        Pending
      </span>
    );
  };

  // ======================================================
  // STAT CARD
  // ======================================================

  const StatCard = ({
    title,
    value,
    icon,
    iconBackground,
    iconColor,
  }) => {
    return (
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${colors.border}`,
          borderRadius: "14px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: colors.textSecondary,
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: "7px 0 0",
              color: colors.text,
              fontSize: "26px",
              fontWeight: "700",
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: iconBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>
    );
  };

  // ======================================================
  // SIDEBAR BUTTON
  // ======================================================

  const SidebarButton = ({
    active,
    icon,
    children,
    onClick,
  }) => {
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%",
          height: "42px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "0 12px",
          marginBottom: "4px",
          border: "none",
          borderRadius: "9px",
          background: active
            ? "rgba(255,255,255,0.10)"
            : "transparent",
          color: active ? "#FFFFFF" : "#94A3B8",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: active ? "600" : "500",
          textAlign: "left",
          transition:
            "background 0.15s ease, color 0.15s ease",
          boxShadow: active
            ? "inset 2px 0 0 #3B82F6"
            : "none",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background =
              "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#E2E8F0";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94A3B8";
          }
        }}
      >
        <span
          style={{
            width: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        <span>{children}</span>
      </button>
    );
  };

  // ======================================================
  // OPEN COMPANY
  // ======================================================

  const openCompany = (company) => {
    setSelectedCompany(company);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        display: "flex",
        color: colors.text,
      }}
    >
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        style={{
          width: "245px",
          minHeight: "100vh",
          background: colors.sidebar,
          color: colors.sidebarText,
          padding: "20px 12px",
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        {/* LOGO */}

        <div
          style={{
            padding: "8px 10px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: colors.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow:
                  "0 4px 12px rgba(37,99,235,0.25)",
                flexShrink: 0,
              }}
            >
              <Sparkles
                size={19}
                color="#FFFFFF"
                strokeWidth={2.2}
              />
            </div>

            <div>
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: "17px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  letterSpacing: "-0.2px",
                }}
              >
                Signalpost
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: "10px",
                  marginTop: "4px",
                  fontWeight: "500",
                  letterSpacing: "0.1px",
                }}
              >
                Company Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <div
          style={{
            padding: "0 11px 9px",
            color: "#64748B",
            fontSize: "10px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Workspace
        </div>

        <SidebarButton
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
          icon={
            <LayoutDashboard
              size={17}
              color="currentColor"
              strokeWidth={2}
            />
          }
        >
          Dashboard
        </SidebarButton>

        <SidebarButton
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
          icon={
            <Building2
              size={17}
              color="currentColor"
              strokeWidth={2}
            />
          }
        >
          Companies
        </SidebarButton>

        <SidebarButton
          active={statusFilter === "researched"}
          onClick={() => setStatusFilter("researched")}
          icon={
            <BrainCircuit
              size={17}
              color="currentColor"
              strokeWidth={2}
            />
          }
        >
          AI Research
        </SidebarButton>

        <SidebarButton
          active={statusFilter === "verified"}
          onClick={() => setStatusFilter("verified")}
          icon={
            <ShieldCheck
              size={17}
              color="currentColor"
              strokeWidth={2}
            />
          }
        >
          Verification
        </SidebarButton>

        {/* BOTTOM */}

        <div
          style={{
            marginTop: "auto",
            padding: "0 7px",
          }}
        >
          <div
            style={{
              borderTop:
                "1px solid rgba(148,163,184,0.12)",
              paddingTop: "16px",
            }}
          >
            <div
              style={{
                background:
                  "rgba(16,185,129,0.07)",
                border:
                  "1px solid rgba(16,185,129,0.12)",
                borderRadius: "9px",
                padding: "10px 11px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#34D399",
                    boxShadow:
                      "0 0 0 3px rgba(52,211,153,0.10)",
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    color: "#D1FAE5",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  System operational
                </span>
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: "10px",
                  marginTop: "8px",
                  paddingLeft: "15px",
                }}
              >
                Data sources
              </div>

              <div
                style={{
                  color: "#CBD5E1",
                  fontSize: "10px",
                  marginTop: "3px",
                  paddingLeft: "15px",
                }}
              >
                Brreg + AI research
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main
        style={{
          marginLeft: "245px",
          width: "calc(100% - 245px)",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            height: "72px",
            background: "#FFFFFF",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: colors.text,
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              Company Intelligence
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: colors.textSecondary,
                fontSize: "13px",
              }}
            >
              Research, analyze and verify company information
            </p>
          </div>

          <button
            onClick={getCompanies}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              border: `1px solid ${colors.border}`,
              color: "#334155",
              padding: "9px 13px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            <RefreshCw
              size={15}
              color="#334155"
              style={{
                animation: loading
                  ? "spin 1s linear infinite"
                  : "none",
              }}
            />

            <span style={{ color: "#334155" }}>
              Refresh
            </span>
          </button>
        </header>

        {/* CONTENT */}

        <div
          style={{
            padding: "28px 30px",
          }}
        >
          {/* STATS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "25px",
            }}
          >
            <StatCard
              title="Total Companies"
              value={totalCompanies}
              icon={<Database size={20} />}
              iconBackground={colors.blueLight}
              iconColor={colors.blue}
            />

            <StatCard
              title="AI Researched"
              value={researchedCompanies}
              icon={<BrainCircuit size={20} />}
              iconBackground={colors.purpleLight}
              iconColor={colors.purple}
            />

            <StatCard
              title="Verified"
              value={verifiedCompanies}
              icon={<ShieldCheck size={20} />}
              iconBackground={colors.greenLight}
              iconColor={colors.green}
            />

            <StatCard
              title="Pending"
              value={pendingCompanies}
              icon={<Clock3 size={20} />}
              iconBackground={colors.amberLight}
              iconColor={colors.amber}
            />
          </div>

          {/* TABLE CARD */}

          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${colors.border}`,
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            {/* TABLE HEADER */}

            <div
              style={{
                padding: "18px 20px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: colors.text,
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  Companies
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: colors.textSecondary,
                    fontSize: "12px",
                  }}
                >
                  Browse and research companies
                </p>
              </div>

              {/* FILTERS */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                {/* SEARCH */}

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <Search
                    size={15}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />

                  <input
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search companies..."
                    style={{
                      width: "210px",
                      height: "36px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      padding: "0 10px 0 32px",
                      outline: "none",
                      fontSize: "12px",
                      color: colors.text,
                      background: "#FFFFFF",
                    }}
                  />
                </div>

                {/* FILTER */}

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  style={{
                    height: "36px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "0 10px",
                    background: "#FFFFFF",
                    color: "#334155",
                    fontSize: "12px",
                    outline: "none",
                  }}
                >
                  <option value="all">All Companies</option>

                  <option value="researched">
                    AI Researched
                  </option>

                  <option value="verified">
                    Verified
                  </option>

                  <option value="pending">
                    Pending
                  </option>
                </select>
              </div>
            </div>

            {/* TABLE */}

            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#F8FAFC",
                    }}
                  >
                    <th style={tableHeaderStyle}>
                      Company
                    </th>

                    <th style={tableHeaderStyle}>
                      Organization Number
                    </th>

                    <th style={tableHeaderStyle}>
                      Industry
                    </th>

                    <th style={tableHeaderStyle}>
                      Status
                    </th>

                    <th
                      style={{
                        ...tableHeaderStyle,
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "50px",
                          textAlign: "center",
                          color: colors.textSecondary,
                        }}
                      >
                        Loading companies...
                      </td>
                    </tr>
                  ) : paginatedCompanies.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "50px",
                          textAlign: "center",
                          color: colors.textSecondary,
                        }}
                      >
                        No companies found.
                      </td>
                    </tr>
                  ) : (
                    paginatedCompanies.map((company) => (
                      <tr
                        key={company._id}
                        style={{
                          borderTop: `1px solid ${colors.border}`,
                        }}
                      >
                        {/* COMPANY */}

                        <td style={tableCellStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "11px",
                            }}
                          >
                            <div
                              style={{
                                width: "35px",
                                height: "35px",
                                borderRadius: "9px",
                                background:
                                  colors.blueLight,
                                color: colors.blue,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                              }}
                            >
                              <Building2 size={17} />
                            </div>

                            <div>
                              <div
                                style={{
                                  color: colors.text,
                                  fontSize: "13px",
                                  fontWeight: "600",
                                }}
                              >
                                {company.name}
                              </div>

                              <div
                                style={{
                                  color:
                                    colors.textSecondary,
                                  fontSize: "11px",
                                  marginTop: "2px",
                                }}
                              >
                                {company.organizationForm ||
                                  "Company"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ORG NUMBER */}

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              color: "#475569",
                              fontSize: "12px",
                            }}
                          >
                            <Hash size={13} />
                            {company.companyNumber}
                          </span>
                        </td>

                        {/* INDUSTRY */}

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              color: "#475569",
                              fontSize: "12px",
                            }}
                          >
                            {company.aiAnalysis?.industry ||
                              company.industry
                                ?.description ||
                              "Not available"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td style={tableCellStyle}>
                          <StatusBadge
                            company={company}
                          />
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            ...tableCellStyle,
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "flex-end",
                              gap: "7px",
                            }}
                          >
                            {/* VIEW REPORT */}

                            {(company.aiAnalysis?.summary ||
                              company.researchStatus ===
                                "completed") && (
                              <button
                                onClick={() =>
                                  openCompany(company)
                                }
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  border: `1px solid ${colors.border}`,
                                  background:
                                    "#FFFFFF",
                                  color: colors.blue,
                                  padding: "7px 10px",
                                  borderRadius: "7px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                }}
                              >
                                <ArrowRight
                                  size={13}
                                  color={
                                    colors.blue
                                  }
                                />

                                <span
                                  style={{
                                    color:
                                      colors.blue,
                                  }}
                                >
                                  View Report
                                </span>
                              </button>
                            )}

                            {/* RESEARCH BUTTON */}

                            <button
                              onClick={() =>
                                researchCompany(
                                  company.companyNumber
                                )
                              }
                              disabled={
                                researching ===
                                company.companyNumber
                              }
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap: "6px",
                                border: "none",
                                background:
                                  researching ===
                                  company.companyNumber
                                    ? colors.pinkDark
                                    : colors.pink,
                                color: "#FFFFFF",
                                padding: "7px 12px",
                                minWidth: "90px",
                                borderRadius: "7px",
                                cursor:
                                  researching ===
                                  company.companyNumber
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize: "11px",
                                fontWeight: "700",
                                boxShadow:
                                  "0 1px 2px rgba(0,0,0,0.08)",
                              }}
                            >
                              {researching ===
                              company.companyNumber ? (
                                <>
                                  <RefreshCw
                                    size={13}
                                    color="#FFFFFF"
                                    style={{
                                      animation:
                                        "spin 1s linear infinite",
                                    }}
                                  />

                                  <span
                                    style={{
                                      color:
                                        "#FFFFFF",
                                    }}
                                  >
                                    Researching
                                  </span>
                                </>
                              ) : (
                                <>
                                  <BrainCircuit
                                    size={13}
                                    color="#FFFFFF"
                                  />

                                  <span
                                    style={{
                                      color:
                                        "#FFFFFF",
                                    }}
                                  >
                                    Research
                                  </span>
                                </>
                              )}
                            </button>

                            {/* VERIFY BUTTON */}

                            {company.facts?.length >
                              0 &&
                              !company.verification
                                ?.verified && (
                                <button
                                  onClick={() =>
                                    verifyCompany(
                                      company._id
                                    )
                                  }
                                  disabled={
                                    verifying ===
                                    company._id
                                  }
                                  style={{
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: "5px",
                                    border: "none",
                                    background:
                                      colors.green,
                                    color: "#FFFFFF",
                                    padding:
                                      "7px 10px",
                                    borderRadius:
                                      "7px",
                                    cursor:
                                      verifying ===
                                      company._id
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize:
                                      "11px",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  <ShieldCheck
                                    size={13}
                                    color="#FFFFFF"
                                  />

                                  <span
                                    style={{
                                      color:
                                        "#FFFFFF",
                                    }}
                                  >
                                    Verify
                                  </span>
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div
              style={{
                padding: "15px 20px",
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  color: colors.textSecondary,
                  fontSize: "12px",
                }}
              >
                Showing{" "}
                {filteredCompanies.length === 0
                  ? 0
                  : (currentPage - 1) *
                      ITEMS_PER_PAGE +
                    1}{" "}
                to{" "}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredCompanies.length
                )}{" "}
                of {filteredCompanies.length}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: `1px solid ${colors.border}`,
                    background: "#FFFFFF",
                    color:
                      currentPage === 1
                        ? "#CBD5E1"
                        : "#334155",
                    borderRadius: "7px",
                    cursor:
                      currentPage === 1
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft
                    size={15}
                    color={
                      currentPage === 1
                        ? "#CBD5E1"
                        : "#334155"
                    }
                  />
                </button>

                <span
                  style={{
                    padding: "0 9px",
                    color: "#475569",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Page {currentPage} of{" "}
                  {Math.max(totalPages, 1)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0
                  }
                  style={{
                    width: "32px",
                    height: "32px",
                    border: `1px solid ${colors.border}`,
                    background: "#FFFFFF",
                    color:
                      currentPage === totalPages
                        ? "#CBD5E1"
                        : "#334155",
                    borderRadius: "7px",
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight
                    size={15}
                    color={
                      currentPage === totalPages
                        ? "#CBD5E1"
                        : "#334155"
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ==================================================
          COMPANY REPORT MODAL
      ================================================== */}

      {selectedCompany && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
            zIndex: 1000,
          }}
          onClick={() => setSelectedCompany(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(900px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: "16px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.18)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding: "22px 24px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background:
                        colors.blueLight,
                      color: colors.blue,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        color: colors.text,
                        fontSize: "19px",
                        fontWeight: "700",
                      }}
                    >
                      {selectedCompany.name}
                    </h2>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color:
                          colors.textSecondary,
                        fontSize: "12px",
                      }}
                    >
                      Organization Number:{" "}
                      {selectedCompany.companyNumber}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedCompany(null)
                }
                style={{
                  width: "34px",
                  height: "34px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#F1F5F9",
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={17} color="#475569" />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div
              style={{
                padding: "24px",
              }}
            >
              {/* COMPANY DETAILS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <DetailBox
                  icon={<Hash size={15} />}
                  title="Organization Number"
                  value={
                    selectedCompany.companyNumber ||
                    "Not available"
                  }
                />

                <DetailBox
                  icon={<MapPin size={15} />}
                  title="Address"
                  value={
                    selectedCompany.address
                      ?.addressLines?.join(", ") ||
                    selectedCompany.address?.city ||
                    "Not available"
                  }
                />

                <DetailBox
                  icon={<Globe size={15} />}
                  title="Website"
                  value={
                    selectedCompany.aiAnalysis
                      ?.website || "Not available"
                  }
                />
              </div>

              {/* AI SUMMARY */}

              <section
                style={{
                  marginBottom: "24px",
                }}
              >
                <SectionTitle
                  icon={<Sparkles size={16} />}
                  title="AI Summary"
                />

                <div
                  style={{
                    background:
                      colors.purpleLight,
                    border: "1px solid #DDD6FE",
                    borderRadius: "10px",
                    padding: "15px",
                    color: "#334155",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedCompany.aiAnalysis
                    ?.summary ||
                    "No AI summary available."}
                </div>
              </section>

              {/* INDUSTRY */}

              <section
                style={{
                  marginBottom: "24px",
                }}
              >
                <SectionTitle
                  icon={<Activity size={16} />}
                  title="Industry"
                />

                <div
                  style={{
                    color: colors.text,
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {selectedCompany.aiAnalysis
                    ?.industry ||
                    selectedCompany.industry
                      ?.description ||
                    "Not available"}
                </div>
              </section>

              {/* FACTS */}

              <section
                style={{
                  marginBottom: "24px",
                }}
              >
                <SectionTitle
                  icon={<Database size={16} />}
                  title={`Key Facts (${
                    selectedCompany.facts?.length || 0
                  })`}
                />

                {selectedCompany.facts?.length >
                0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {selectedCompany.facts.map(
                      (fact, index) => (
                        <div
                          key={index}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: "9px",
                            padding: "12px",
                          }}
                        >
                          <div
                            style={{
                              color: colors.text,
                              fontSize: "13px",
                              fontWeight: "600",
                            }}
                          >
                            {fact.value}
                          </div>

                          <div
                            style={{
                              marginTop: "7px",
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                background:
                                  fact.confidence ===
                                  "high"
                                    ? colors.greenLight
                                    : fact.confidence ===
                                      "low"
                                    ? colors.redLight
                                    : colors.amberLight,
                                color:
                                  fact.confidence ===
                                  "high"
                                    ? colors.green
                                    : fact.confidence ===
                                      "low"
                                    ? colors.red
                                    : colors.amber,
                                padding:
                                  "3px 7px",
                                borderRadius:
                                  "999px",
                                fontSize: "10px",
                                fontWeight: "600",
                              }}
                            >
                              {fact.confidence ||
                                "medium"}
                            </span>

                            {fact.source && (
                              <a
                                href={fact.source}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "4px",
                                  color:
                                    colors.blue,
                                  fontSize:
                                    "10px",
                                  textDecoration:
                                    "none",
                                }}
                              >
                                Source
                                <ExternalLink
                                  size={11}
                                />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      color:
                        colors.textSecondary,
                      fontSize: "13px",
                    }}
                  >
                    No facts available.
                  </div>
                )}
              </section>

              {/* SOURCES */}

              <section
                style={{
                  marginBottom: "24px",
                }}
              >
                <SectionTitle
                  icon={<Search size={16} />}
                  title={`Sources (${
                    selectedCompany.sources?.length ||
                    0
                  })`}
                />

                {selectedCompany.sources?.length >
                0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {selectedCompany.sources.map(
                      (source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: "8px",
                            padding: "11px",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            color: colors.blue,
                            textDecoration:
                              "none",
                            fontSize: "12px",
                          }}
                        >
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {source.title ||
                              source.url}
                          </span>

                          <ExternalLink
                            size={14}
                            style={{
                              flexShrink: 0,
                              marginLeft: "10px",
                            }}
                          />
                        </a>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      color:
                        colors.textSecondary,
                      fontSize: "13px",
                    }}
                  >
                    No sources available.
                  </div>
                )}
              </section>

              {/* VERIFICATION */}

              <section>
                <SectionTitle
                  icon={<ShieldCheck size={16} />}
                  title="Source Verification"
                />

                <div
                  style={{
                    border: `1px solid ${
                      selectedCompany.verification
                        ?.verified
                        ? "#A7F3D0"
                        : colors.border
                    }`,
                    background:
                      selectedCompany
                        .verification?.verified
                        ? colors.greenLight
                        : "#F8FAFC",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "8px",
                      color:
                        selectedCompany
                          .verification
                          ?.verified
                          ? colors.green
                          : colors.textSecondary,
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedCompany
                      .verification?.verified ? (
                      <>
                        <CheckCircle2
                          size={17}
                        />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock3 size={17} />
                        Not Verified
                      </>
                    )}
                  </div>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color:
                        colors.textSecondary,
                      fontSize: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedCompany
                      .verification?.reason ||
                      "No verification information available."}
                  </p>

                  {!selectedCompany
                    .verification?.verified &&
                    selectedCompany.facts
                      ?.length > 0 && (
                      <button
                        onClick={() =>
                          verifyCompany(
                            selectedCompany._id
                          )
                        }
                        disabled={
                          verifying ===
                          selectedCompany._id
                        }
                        style={{
                          marginTop: "12px",
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "6px",
                          border: "none",
                          background:
                            colors.green,
                          color: "#FFFFFF",
                          padding:
                            "8px 13px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        <ShieldCheck
                          size={14}
                          color="#FFFFFF"
                        />

                        <span
                          style={{
                            color: "#FFFFFF",
                          }}
                        >
                          Verify Sources
                        </span>
                      </button>
                    )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          GLOBAL ANIMATION
      ================================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          button,
          input,
          select {
            font-family: inherit;
          }

          button:focus-visible,
          input:focus-visible,
          select:focus-visible {
            outline: 2px solid #93C5FD;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  );
}

// ======================================================
// TABLE STYLES
// ======================================================

const tableHeaderStyle = {
  padding: "11px 15px",
  textAlign: "left",
  color: "#64748B",
  fontSize: "10px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "13px 15px",
  verticalAlign: "middle",
};

// ======================================================
// DETAIL BOX
// ======================================================

function DetailBox({ icon, title, value }) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "9px",
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#64748B",
          fontSize: "10px",
          fontWeight: "600",
          marginBottom: "5px",
        }}
      >
        {icon}

        <span>{title}</span>
      </div>

      <div
        style={{
          color: "#0F172A",
          fontSize: "12px",
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ======================================================
// SECTION TITLE
// ======================================================

function SectionTitle({ icon, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        color: "#0F172A",
        fontSize: "14px",
        fontWeight: "700",
        marginBottom: "10px",
      }}
    >
      <span
        style={{
          color: "#2563EB",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>

      <span>{title}</span>
    </div>
  );
}

export default App;


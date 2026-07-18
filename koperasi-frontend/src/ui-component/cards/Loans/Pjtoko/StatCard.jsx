import React from "react";

const colors = {
  blue: {
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    number: "#2563eb"
  },
  green: {
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    number: "#16a34a"
  },
  red: {
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
    number: "#dc2626"
  },
  orange: {
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
    number: "#ea580c"
  }
};

const StatCard = ({ title, value, color, icon, badge, badgeColor }) => {

  const theme = colors[color] || colors.blue;
  const badgeTheme = colors[badgeColor || color] || colors.green;

  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "1.5rem",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        flex: 1,
        position: "relative"
      }}
    >

      {badge && (
        <span
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: badgeTheme.iconBg,
            color: badgeTheme.iconColor,
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "999px"
          }}
        >
          {badge}
        </span>
      )}

      <div
        style={{
          width: "40px",
          height: "40px",
          background: theme.iconBg,
          color: theme.iconColor,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          fontWeight: "bold"
        }}
      >
        {icon}
      </div>

      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "6px" }}>
        {title}
      </p>

      <h2
        style={{
          fontSize: "36px",
          color: theme.number,
          fontWeight: "700"
        }}
      >
        {value}
      </h2>

    </div>
  );
};

export default StatCard;
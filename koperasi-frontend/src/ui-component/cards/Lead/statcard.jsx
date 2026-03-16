import React from "react";
import { Box, Typography, Grid } from "@mui/material";

const colors = {
  blue: {
    iconBg: "#e0e7ff",
    iconColor: "#4f46e5",
    number: "#4f46e5",
    badgeBg: "#eef2ff",
    badgeColor: "#4338ca"
  },
  green: {
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    number: "#16a34a",
    badgeBg: "#ecfdf5",
    badgeColor: "#16a34a"
  },
  orange: {
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
    number: "#ea580c",
    badgeBg: "#fff7ed",
    badgeColor: "#ea580c"
  }
};

const StatCard = ({ title, value, color = "blue", icon, badge }) => {
  const theme = colors[color];

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        p: 3,
        position: "relative",
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
        }
      }}
    >
      {badge && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: theme.badgeBg,
            color: theme.badgeColor,
            px: 1.2,
            py: 0.4,
            fontSize: 12,
            fontWeight: 600,
            borderRadius: "999px"
          }}
        >
          {badge}
        </Box>
      )}

      <Box
        sx={{
          width: 42,
          height: 42,
          bgcolor: theme.iconBg,
          color: theme.iconColor,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2
        }}
      >
        {icon}
      </Box>

      <Typography sx={{ fontSize: 14, color: "#64748b", mb: 0.5 }}>
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 30,
          fontWeight: 700,
          color: theme.number
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default StatCard;
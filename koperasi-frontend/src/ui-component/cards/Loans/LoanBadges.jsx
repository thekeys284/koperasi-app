import React, { useState } from 'react';
import { Chip, Box, Typography, Stack } from '@mui/material';

const RejectionNote = ({ reason }) => {
    const [expanded, setExpanded] = useState(false);
    if (!reason) return null;

    const isLong = reason.length > 50;
    const displayText = expanded || !isLong ? reason : `${reason.substring(0, 50)}...`;

    return (
        <Box
            sx={{
                mt: 0.5,
                maxWidth: 180,
                cursor: isLong ? "pointer" : "default"
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (isLong) setExpanded(!expanded);
            }}
        >
            <Typography
                fontSize={11}
                color="#DC2626"
                fontWeight={500}
                sx={{
                    lineHeight: 1.4,
                    fontStyle: "italic",
                    backgroundColor: "#FEF2F2",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #FEE2E2"
                }}
            >
                Alasan: {displayText}
                {isLong && !expanded && (
                    <Typography component="span" fontSize={10} sx={{ ml: 0.5, fontWeight: 700 }}>
                        (Lihat)
                    </Typography>
                )}
            </Typography>
        </Box>
    );
};

export const LoanStatusBadge = ({ status, reason = null, showReason = true }) => {
    const config = {
        pending: {
            label: "Menunggu Admin",
            bg: "#FEF3C7", // Amber
            color: "#D97706",
        },
        pending_pengajuan: {
            label: "Menunggu Lead",
            bg: "#E0F2FE", // Sky Blue
            color: "#0284C7",
        },
        postpone: {
            label: "Review Penundaan",
            bg: "#F3E8FF", // Purple
            color: "#9333EA",
        },
        disetujui_ketua: {
            label: "Disetujui",
            bg: "#DCFCE7", // Green
            color: "#16A34A",
        },
        aktif: {
            label: "Aktif",
            bg: "#DCFCE7", // Green
            color: "#16A34A",
        },
        paid: {
            label: "Lunas",
            bg: "#DBEAFE", // Blue
            color: "#2563EB",
        },
        rejected: {
            label: "Ditolak",
            bg: "#FEE2E2", // Red
            color: "#DC2626",
        },
    };

    const item = config[status] || config.pending;

    const badge = (
        <Chip
            label={item.label}
            size="small"
            sx={{
                background: item.bg,
                color: item.color,
                fontWeight: 600,
            }}
        />
    );

    if (showReason && status === "rejected" && reason) {
        return (
            <Stack spacing={0.5} alignItems="flex-start">
                {badge}
                <RejectionNote reason={reason} />
            </Stack>
        );
    }

    return badge;
};

export const LoanTypeBadge = ({ type }) => {
    const config = {
        konsumtif: { bg: "#F3E8FF", color: "#9333EA" },
        produktif: { bg: "#DBEAFE", color: "#2563EB" },
    };

    const safeType = String(type || "konsumtif").toLowerCase();
    const badge = config[safeType] || config.konsumtif;

    return (
        <Chip
            label={safeType}
            size="small"
            sx={{
                background: badge.bg,
                color: badge.color,
                fontWeight: 600,
                textTransform: "uppercase",
            }}
        />
    );
};

export const LoanModeBadge = ({ mode }) => {
    const normalized = String(mode || "new").toLowerCase();
    const isTopup = normalized === "topup";

    return (
        <Chip
            label={isTopup ? "TOP-UP" : "BARU"}
            size="small"
            sx={{
                background: isTopup ? "#FEE2E2" : "#E0F2FE",
                color: isTopup ? "#B91C1C" : "#075985",
                fontWeight: 700,
                textTransform: "uppercase",
            }}
        />
    );
};

export const InstallmentStatusBadge = ({ status }) => {
    const config = {
        paid: {
            label: "Sudah Bayar",
            sx: { bgcolor: "#16A34A", color: "#fff", fontWeight: 600 }
        },
        unpaid: {
            label: "Belum Bayar",
            sx: { bgcolor: "#F59E0B", color: "#fff", fontWeight: 600 }
        },
        locked: {
            label: "Terkunci",
            sx: { bgcolor: "#E2E8F0", color: "#64748B", fontWeight: 600 }
        },
        postponed: {
            label: "Ditunda",
            sx: { bgcolor: "#0284C7", color: "#fff", fontWeight: 600 }
        },
        waiting_postpone: {
            label: "Menunggu Tunda",
            sx: { bgcolor: "#94A3B8", color: "#fff", fontWeight: 600 }
        },
    };

    const item = config[status] || config.unpaid;

    return (
        <Chip
            label={item.label}
            size="small"
            sx={item.sx}
        />
    );
};

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Breadcrumbs,
  Link,
  LinearProgress,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import ConfirmPaymentModal from "../../../ui-component/cards/Loans/Admin/ConfirmPaymentModal";

import fileBlueIcon from "../../../assets/images/admin/file-blue.svg";
import checkGreenIcon from "../../../assets/images/admin/check-green.svg";
import alertOrangeIcon from "../../../assets/images/admin/alert-orange.svg";

export default function LoanDetails() {
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.pathname.includes("/admin");
  const basePath = isAdmin ? "/admin/loans" : "/user/loans";
  return (
    <Box sx={{ p: 4, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* BREADCRUMB */}
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate(basePath)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pinjaman
        </Link>
        <Typography color="text.primary">Detail Pinjaman</Typography>
      </Breadcrumbs>

      {/* LABEL */}
      <Chip
        label="Pinjaman Aktif"
        sx={{
          background: "#DBEAFE",
          color: "#2563EB",
          fontWeight: 600,
          mb: 1,
        }}
        size="small"
      />

      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={1}
      >
        <Box> 
          <Typography variant="h5" fontWeight={700}>
            ID Pinjam: #PJM-2023001
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 0.8,
            backgroundColor: "#2563EB",
            boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
            "&:hover": {
              backgroundColor: "#1D4ED8",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.23)",
            }
          }}
        >
          Cetak Rekap
        </Button>
      </Stack>

      {/* STAT CARDS */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mt={4} width="100%">
        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
          <CardContent>
            <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
              Total Pinjaman Pokok
            </Typography>
            </Typography>
            <Typography fontSize={28} fontWeight={800} color="#16A34A">
              Rp 2.000.000
            </Typography>
            <LinearProgress
              variant="determinate"
              value={40}
              sx={{
                mt: 1.5,
                borderRadius: 2,
                height: 6,
                backgroundColor: "#E5E7EB",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#16A34A",
                  borderRadius: 2,
                },
              }}
            />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
          <CardContent>
            <Typography fontSize={15} fontWeight={600} color="#64748B" mb={1}>
              Sisa Pinjaman
            </Typography>
            <Typography fontSize={28} fontWeight={800} color="#EF4444">
              Rp 3.000.000
            </Typography>
            <Typography fontSize={13} fontWeight={500} color="#94A3B8" sx={{ display: "block", mt: 1 }}>
              3 dari 5 cicilan tersisa
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* INFORMASI PINJAMAN */}
      <Card sx={{ mt: 4, borderRadius: 3, border: "1px solid #E5E7EB", boxShadow: "none" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, px: 3 }}
        >
          <Typography fontWeight={700} color="#1E293B">Informasi Pinjaman</Typography>

          <Chip
            label="KONSUMTIF"
            size="small"
            sx={{
              background: "#F3E8FF",
              color: "#9333EA",
              fontWeight: 700,
            }}
          />
        </Stack>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                Jenis Pinjaman
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", borderTop: "1px solid #E5E7EB", px: 3, py: 1.5 }}>
                Konsumtif
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                Jumlah Pinjaman
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                Rp 5.000.000
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                Tenor
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                5 Bulan
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                Tgl Potong
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                12 Okt 2023
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: "30%", color: "#334155", fontWeight: 600, borderBottom: "none", px: 3, py: 1.5 }}>
                Tgl Pengajuan
              </TableCell>
              <TableCell sx={{ color: "#64748B", borderBottom: "none", px: 3, py: 1.5 }}>
                10 Okt 2023
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* JADWAL CICILAN */}
      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Jadwal Pembayaran Cicilan
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 600,
                "& .MuiTableBody-root .MuiTableRow-root": {
                  transition: "background-color 0.2s",
                },
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: "#F8FAFC",
                },
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid #F1F5F9",
                  py: 2,
                  px: 2,
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#F8FAFC",
                    "& .MuiTableCell-head": {
                      fontWeight: 700,
                      fontSize: "12px",
                      color: "#475569",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #E2E8F0",
                    },
                  }}
                >
                  <TableCell>ID CICILAN</TableCell>
                  <TableCell>CICILAN KE</TableCell>
                  <TableCell>TANGGAL JATUH TEMPO</TableCell>
                  <TableCell>NOMINAL</TableCell>
                  <TableCell>STATUS</TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>#CIC-2001</TableCell>
                <TableCell>1</TableCell>
                <TableCell>12 Okt 2023</TableCell>
                <TableCell>Rp 1.000.000</TableCell>
                <TableCell>
                  <Chip label="Sudah Bayar" color="success" size="small" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>#CIC-2002</TableCell>
                <TableCell>2</TableCell>
                <TableCell>12 Nov 2023</TableCell>
                <TableCell>Rp 1.000.000</TableCell>
                <TableCell>
                  <Chip label="Sudah Bayar" color="success" size="small" />
                </TableCell>
              </TableRow>

              <TableRow sx={{ background: "#eef2ff" }}>
                <TableCell>#CIC-2003</TableCell>
                <TableCell>3</TableCell>
                <TableCell>12 Des 2023</TableCell>
                <TableCell>Rp 1.000.000</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: 3 }}
                    onClick={() => setOpenConfirmModal(true)}
                  >
                    Konfirmasi Pembayaran &gt;
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>#CIC-2004</TableCell>
                <TableCell>4</TableCell>
                <TableCell>12 Jan 2024</TableCell>
                <TableCell>Rp 1.000.000</TableCell>
                <TableCell>
                  <Chip label="Terkunci" size="small" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>#CIC-2005</TableCell>
                <TableCell>5</TableCell>
                <TableCell>12 Feb 2024</TableCell>
                <TableCell>Rp 1.000.000</TableCell>
                <TableCell>
                  <Chip label="Terkunci" size="small" />
                </TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <ConfirmPaymentModal
        open={openConfirmModal}
        handleClose={() => setOpenConfirmModal(false)}
      />
    </Box>
  );
}

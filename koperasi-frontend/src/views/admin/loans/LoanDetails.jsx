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

      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={1}
      >
        <Box>
          <Chip
            label="PINJAMAN AKTIF"
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />

          <Typography variant="h5" fontWeight={700}>
            ID Pinjam: #PJM-2023001
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ borderRadius: 3 }}
        >
          Cetak Rekap
        </Button>
      </Stack>

      {/* STAT CARD */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          mt: 4,
          flexWrap: "wrap",
        }}
      >
        <StatCard
          title="Total Pinjaman Pokok"
          value="Rp 5.000.000"
          color="blue"
          icon={<img src={fileBlueIcon} width={24} />}
        />

        <StatCard
          title="Total Terbayar"
          value="Rp 2.000.000"
          color="green"
          icon={<img src={checkGreenIcon} width={24} />}
        />

        <StatCard
          title="Sisa Pinjaman"
          value="Rp 3.000.000"
          color="orange"
          icon={<img src={alertOrangeIcon} width={24} />}
        />
      </Box>

      {/* INFORMASI PINJAMAN */}
      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography fontWeight={700}>Informasi Pinjaman</Typography>

            <Chip label="KONSUMTIF" size="small" color="secondary" />
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography color="text.secondary">Jenis Pinjaman</Typography>
              <Typography>Konsumtif</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography color="text.secondary">Jumlah Pinjaman</Typography>
              <Typography>Rp 5.000.000</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography color="text.secondary">Tenor</Typography>
              <Typography>5 Bulan</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography color="text.secondary">Tgl Potong</Typography>
              <Typography>12 Okt 2023</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography color="text.secondary">Tgl Pengajuan</Typography>
              <Typography>10 Okt 2023</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* JADWAL CICILAN */}
      <Card sx={{ mt: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={2}>
            Jadwal Pembayaran Cicilan
          </Typography>

          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f3f4f6",
                  "& .MuiTableCell-head": {
                    fontWeight: 700,
                    fontSize: "12px",
                    color: "#64748b",
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
        </CardContent>
      </Card>

      <ConfirmPaymentModal
        open={openConfirmModal}
        handleClose={() => setOpenConfirmModal(false)}
      />
    </Box>
  );
}

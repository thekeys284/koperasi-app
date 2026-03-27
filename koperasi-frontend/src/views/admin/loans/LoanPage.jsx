import React from "react";
import { useNavigate } from "react-router-dom";

import StatCard from "../../../ui-component/cards/Loans/Admin/StatCard";
import fileBlueIcon from "../../../assets/images/admin/file-blue.svg";
import checkGreenIcon from "../../../assets/images/admin/check-green.svg";
import alertOrangeIcon from "../../../assets/images/admin/alert-orange.svg";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Pagination,
  Box,
  Select,
  MenuItem,
  IconButton,
  Breadcrumbs,
  Link,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import FilterListIcon from "@mui/icons-material/FilterList";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    aktif: {
      label: "Aktif",
      color: "#16a34a",
      bg: "#dcfce7",
    },
    lunas: {
      label: "Lunas",
      color: "#2563eb",
      bg: "#dbeafe",
    },
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        background: config.bg,
        color: config.color,
        fontWeight: 600,
      }}
    />
  );
};

const LoanTypeBadge = ({ type }) => {
  const config = {
    konsumtif: { bg: "#F3E8FF", color: "#9333EA" },
    produktif: { bg: "#DBEAFE", color: "#2563EB" },
  };

  return (
    <Chip
      label={type}
      size="small"
      sx={{
        background: config[type].bg,
        color: config[type].color,
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    />
  );
};

const LoanPage = () => {
  const navigate = useNavigate();
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
          color="text.primary"
          onClick={() => navigate("/admin/loans")}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          Pinjaman
        </Link>
      </Breadcrumbs>

      <Typography variant="h2" fontWeight={800} mb={1}>
        Daftar Pengajuan Pinjaman Aktif
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Kelola dan tinjau status pengajuan pinjaman anggota secara real-time.
      </Typography>

      {/* STAT CARD */}
      <Stack direction="row" fontWeight={500} spacing={3} mb={4}>
        <StatCard
          title="Total Pengajuan"
          value={45}
          color="blue"
          icon={<img src={fileBlueIcon} width={24} />}
        />

        <StatCard
          title="Total Pinjaman Aktif"
          value={10}
          color="green"
          icon={<img src={checkGreenIcon} width={24} />}
          badge="Disetujui"
        />

        <StatCard
          title="Total Pinjaman Macet"
          value={1}
          color="orange"
          icon={<img src={alertOrangeIcon} width={24} />}
        />
      </Stack>

      {/* TABLE PENUNDAAN */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Typography
            color="text.primary"
            fontSize="18px"
            fontWeight={800}
            mb={2}
          >
            Daftar Penundaan Pinjaman
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
                  <TableCell>ID & TGL PENGAJUAN</TableCell>
                  <TableCell>ANGGOTA</TableCell>
                  <TableCell>JENIS & JUMLAH</TableCell>
                  <TableCell>TENOR</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>DETAIL</TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography color="primary" fontWeight={600}>
                    #PJ-2023-001
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    10 Okt 2023
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography fontWeight={600}>Siti Rahmah</Typography>
                  <Typography variant="caption" color="text.secondary">
                    NIP
                  </Typography>
                </TableCell>

                <TableCell>
                  <LoanTypeBadge type="produktif" />
                  <Typography fontWeight={700}>Rp 5.000.000</Typography>
                </TableCell>

                <TableCell>5 Bulan</TableCell>

                <TableCell>
                  <StatusBadge status="pending" />
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => navigate("/admin/loans/details")}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Menampilkan 1-4 dari 45 permohonan
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" disabled>
                Sebelumnya
              </Button>

              <Pagination count={3} page={1} size="small" />

              <Button size="small">Selanjutnya</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* TABLE PINJAMAN AKTIF */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              color="text.primary"
              fontSize="18px"
              fontWeight={800}
              mb={2}
            >
              Daftar Pinjaman Aktif
            </Typography>

            {/* <Stack direction="row" spacing={1}>
              <Select size="small" defaultValue="semua">
                <MenuItem value="semua">Semua Status</MenuItem>
                <MenuItem value="aktif">Aktif</MenuItem>
                <MenuItem value="lunas">Lunas</MenuItem>
              </Select>

              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Stack> */}
          </Stack>

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
                  <TableCell>ID & TGL PENGAJUAN</TableCell>
                  <TableCell>ANGGOTA</TableCell>
                  <TableCell>JENIS & JUMLAH</TableCell>
                  <TableCell>TENOR</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>DETAIL</TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography color="primary" fontWeight={600}>
                    #PJ-2023-007
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    10 Okt 2023
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography fontWeight={600}>Budi Santoso</Typography>
                  <Typography variant="caption" color="text.secondary">
                    NIP
                  </Typography>
                </TableCell>

                <TableCell>
                  <LoanTypeBadge type="konsumtif" />
                  <Typography fontWeight={700}>Rp 5.000.000</Typography>
                </TableCell>

                <TableCell>12 Bulan</TableCell>

                <TableCell>
                  <StatusBadge status="aktif" />
                </TableCell>

                <TableCell>
                  <IconButton onClick={() => navigate("/admin/loans/details")}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="body2" color="text.secondary">
              Menampilkan 1-4 dari 45 permohonan
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" disabled>
                Sebelumnya
              </Button>

              <Pagination count={3} page={1} size="small" />

              <Button size="small">Selanjutnya</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanPage;

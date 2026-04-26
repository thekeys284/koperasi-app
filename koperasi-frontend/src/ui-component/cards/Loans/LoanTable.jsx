import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';

const LoanTable = ({ title, columns, data, emptyMessage = "Tidak ada data.", hideCard = false, onRowClick, isRowSelected }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

  const content = (
    <React.Fragment>
      {title && (
        <Typography color="text.primary" fontSize="18px" fontWeight={800} mb={2}>
          {title}
        </Typography>
      )}
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 600, "& .MuiTableCell-root": { borderBottom: "1px solid #F1F5F9", py: 2, px: 2 } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F8FAFC", "& .MuiTableCell-head": { fontWeight: 700, fontSize: "12px", color: "#475569", textTransform: "uppercase", borderBottom: "2px solid #E2E8F0" } }}>
              {columns.map((col, index) => (
                <TableCell key={index} align={col.align || 'left'} sx={col.sx || {}}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  hover
                  selected={isRowSelected ? isRowSelected(row) : false}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&.Mui-selected > *": {
                      backgroundColor: "#EFF6FF",
                    },
                    "&.Mui-selected:hover > *": {
                      backgroundColor: "#DBEAFE",
                    },
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} align={col.align || 'left'} sx={col.cellSx || {}}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      {data && data.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman:"
        />
      )}
    </React.Fragment>
  );

  if (hideCard) return content;

  return (
    <Card sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default LoanTable;

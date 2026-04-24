import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import { IconFileDescription, IconPlus, IconWallet, IconInfoCircle, IconArrowUpCircle } from '@tabler/icons-react';

const formatCurrency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(Number(value || 0))}`;

const InfoBox = ({ icon: Icon, title, subtitle, amount, color }) => (
  <Box sx={{ 
    flex: 1, 
    bgcolor: 'white', 
    p: 2, 
    borderRadius: 3, 
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%'
  }}>
    <Box sx={{ 
      width: 44, 
      height: 44, 
      borderRadius: '12px', 
      bgcolor: color === 'green' ? '#F0FDF4' : (color === 'purple' ? '#F5F3FF' : '#F0F9FF'),
      color: color === 'green' ? '#16A34A' : (color === 'purple' ? '#7C3AED' : '#0369A1'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size="1.4rem" />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={700} color="#1E293B" noWrap>{title}</Typography>
      <Typography variant="caption" color="#64748B" sx={{ display: 'block' }} noWrap>{subtitle}</Typography>
      <Typography variant="h5" fontWeight={800} color={color === 'green' ? '#16A34A' : (color === 'purple' ? '#7C3AED' : '#0369A1')} sx={{ mt: 0.5 }}>
        {formatCurrency(amount)}
      </Typography>
    </Box>
  </Box>
);

const TopupInfoCard = ({ referredLoan, currentAmount, isInsideAccordion }) => {
  if (!referredLoan) return null;

  const sisaLama = Number(referredLoan.sisa_pinjaman || 0);
  const baru = Number(currentAmount || 0);
  const total = sisaLama + baru;

  return (
    <Card sx={{ 
      borderRadius: isInsideAccordion ? 0 : 4, 
      border: isInsideAccordion ? 'none' : '1px solid #DBEAFE', 
      bgcolor: isInsideAccordion ? 'transparent' : '#F8FAFF', 
      boxShadow: 'none',
      mb: isInsideAccordion ? 0 : 3,
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 3 }}>
        {!isInsideAccordion && (
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Box sx={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              bgcolor: '#2563EB', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <IconArrowUpCircle size="1.5rem" />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} color="#1E293B">Informasi Top-Up</Typography>
              <Typography variant="body2" color="#64748B">Sisa pinjaman lama akan otomatis digabung ke pinjaman baru.</Typography>
            </Box>
          </Stack>
        )}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="center">
          <InfoBox 
            icon={IconFileDescription}
            title="Pinjaman Lama"
            subtitle={referredLoan.loan_number}
            amount={sisaLama}
            color="blue"
          />
          
          <Typography variant="h4" fontWeight={400} color="#94A3B8" sx={{ opacity: 0.7 }}>+</Typography>

          <InfoBox 
            icon={IconPlus}
            title="Pinjaman Baru"
            subtitle="(Top-Up)"
            amount={baru}
            color="green"
          />

          <Typography variant="h4" fontWeight={400} color="#94A3B8" sx={{ opacity: 0.7 }}>=</Typography>

          <InfoBox 
            icon={IconWallet}
            title="Total Pinjaman Baru"
            subtitle="Setelah Top-Up"
            amount={total}
            color="purple"
          />
        </Stack>

        <Box sx={{ 
          mt: 3, 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: '#EFF6FF', 
          border: '1px dashed #BFDBFE',
          display: 'flex',
          gap: 1.5,
          alignItems: 'center'
        }}>
          <IconInfoCircle size="1.2rem" color="#2563EB" />
          <Typography variant="caption" color="#1E3A8A" fontWeight={600}>
            Total pinjaman baru menjadi dasar perhitungan cicilan selanjutnya.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopupInfoCard;

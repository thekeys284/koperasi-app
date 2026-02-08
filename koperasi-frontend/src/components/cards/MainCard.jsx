import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MainCard = ({ title, children }) => {
  return (
    <Card sx={{ mb: 2 }}>
      {title && <Typography variant="h6" sx={{ p: 2 }}>{title}</Typography>}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default MainCard;

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
    Stack,
    Box
} from '@mui/material';
import { IconCircleX } from '@tabler/icons-react';

const LoanProofModal = ({ open, onClose, imageUrl, title = "Preview Bukti Nota" }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            PaperProps={{ 
                sx: { 
                    borderRadius: "16px", 
                    overflow: "hidden",
                    bgcolor: 'transparent',
                    boxShadow: 'none'
                } 
            }}
        >
            <Box sx={{ bgcolor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}
                >
                    <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
                        {title}
                    </Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
                        <IconCircleX size={18} />
                    </IconButton>
                </Stack>
                <DialogContent sx={{ p: 0, lineHeight: 0 }}>
                    {imageUrl ? (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={title}
                            sx={{ 
                                width: "100%", 
                                height: "auto",
                                display: "block" 
                            }}
                        />
                    ) : (
                        <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Typography color="textSecondary">Gambar tidak tersedia</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default LoanProofModal;

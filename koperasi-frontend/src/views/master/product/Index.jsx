import { useNavigate } from 'react-router-dom';
import {useEffect,useState} from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Typography, TableContainer,
    Paper, CircularProgress, Box, Chip, Button, TextField, InputAdornment, TablePagination
} from '@mui/material';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconPackage } from '@tabler/icons-react';
import MainCard from '../../../components/cards/MainCard.jsx';
import api from '@/api/axios';

const ProductPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ page, setPage ] = useState(0);
    const [ rowsPerPage, setRowsPerPage ] = useState(10);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
        } finally {
            setLoading(false);
        }
    };

    // filer dan pagination
    const filteredProducts = products.filter((item) =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.includes(searchTerm)
    );
    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };
    const handleAdd=()=>{
        navigate('/pjtoko/products/add');
    }

    return (
        <MainCard title="Daftar Barang">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder='Cari Barang atau Barcode'
                    size='small'
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconSearch size="18" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 200, flex: 1, maxWidth: 400 }} // field bisa fleksibel tapi tetap maksimal 400px
                />
                <Button variant='contained' color='primary' onClick={handleAdd}>
                    Tambah Barang
                </Button>
            </Box>
        {loading ? (
            <Box sx={{ textAlign: 'center', p: 5}}><CircularProgress /></Box>
        ):(
            <Paper sx={{ width: '100%', overflow:'hidden', boxShadow:'none'}}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Barcode</TableCell>
                                <TableCell>Nama Produk</TableCell>
                                <TableCell align='center'>Stok</TableCell>
                                <TableCell align='right'>Harga Jual</TableCell>
                                <TableCell align='center'>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProducts.length > 0 ?(
                                paginatedProducts.map((row)=>(
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.barcode}</TableCell>
                                        <TableCell>
                                            <Typography variant='subtitle2'>{row.product_name}</Typography>
                                            <Typography variant='caption'>{row.category?.category_name}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography color={row.total_stock <= row.min_stock ? 'error' : 'inherit'}>
                                                {row.total_stock || 0}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align='right'>
                                            Rp {new Intl.NumberFormat('id-ID').format(row.current_selling_price)}
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Button size='small' onClick={()=>navigate(`/pjtoko/products/edit/${row.id}`)}>
                                                <IconEdit size={16}/>
                                            </Button>
                                            <Button size='small' color='error'
                                                onClick={async () => {
                                                    if(window.confirm('Yakin ingin menghapus produk ini?')) {
                                                    try {
                                                        await api.delete(`/products/${row.id}`);
                                                        fetchProducts(); // refresh tabel
                                                    } catch(err) {
                                                        console.error('Gagal menghapus produk', err);
                                                    }
                                                    }
                                                }}>
                                                <IconTrash size='16'/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))):(
                                    <TableRow>
                                        <TableCell colSpan={5} align='center' sx={{py:3}}>Data tidak ditemukan</TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5,10,25]}
                    component='div'
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Data per halaman"
                />
            </Paper>
        )
        }
        </MainCard>
    );
};

export default ProductPage;

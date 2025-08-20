import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsApi, categoriesApi } from '../services/api';
import { Product, Category } from '../types';

const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newCost, setNewCost] = useState<string>('');
  const [bulkCostCategory, setBulkCostCategory] = useState<number | ''>('');
  const [bulkCostValue, setBulkCostValue] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: categories } = useQuery('categories', () => categoriesApi.getWithCounts());
  const { data: products, isLoading } = useQuery(
    ['products', selectedCategory],
    () => productsApi.getAll(selectedCategory || undefined)
  );

  const updateCostMutation = useMutation(
    ({ odooId, cost }: { odooId: number; cost: number }) =>
      productsApi.updateCost(odooId, cost),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setEditProduct(null);
        setNewCost('');
      },
    }
  );

  const updateBulkCostMutation = useMutation(
    ({ categoryId, cost }: { categoryId: number; cost: number }) =>
      productsApi.updateCategoryCost(categoryId, cost),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setBulkCostCategory('');
        setBulkCostValue('');
      },
    }
  );

  const filteredProducts = products && Array.isArray(products.data) 
    ? products.data.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleEditCost = (product: Product) => {
    setEditProduct(product);
    setNewCost(product.cost.toString());
  };

  const handleSaveCost = () => {
    if (editProduct && newCost) {
      updateCostMutation.mutate({
        odooId: editProduct.odoo_id,
        cost: parseFloat(newCost),
      });
    }
  };

  const handleBulkUpdate = () => {
    if (bulkCostCategory && bulkCostValue) {
      updateBulkCostMutation.mutate({
        categoryId: bulkCostCategory as number,
        cost: parseFloat(bulkCostValue),
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Productos
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actualización Masiva por Categoría
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={bulkCostCategory}
                  onChange={(e) => setBulkCostCategory(e.target.value as number | '')}
                >
                  {categories && Array.isArray(categories.data) && categories.data.map((category: Category) => (
                    <MenuItem key={category.odoo_id} value={category.odoo_id}>
                      {category.name} ({category.product_count} productos)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Nuevo Costo"
                type="number"
                value={bulkCostValue}
                onChange={(e) => setBulkCostValue(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                color="warning"
                onClick={handleBulkUpdate}
                disabled={!bulkCostCategory || !bulkCostValue}
              >
                Actualizar Todos los Productos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <TextField
              label="Buscar productos"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Categoría</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as number | '')}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {Array.isArray(categories?.data) && categories.data.map((category: Category) => (
                  <MenuItem key={category.odoo_id} value={category.odoo_id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell>Última Actualización</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: Product) => (
                <TableRow key={product.odoo_id}>
                  <TableCell>{product.code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<CategoryIcon />}
                      label={product.category_name}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${product.cost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(product.last_updated).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditCost(product)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)}>
        <DialogTitle>Editar Costo del Producto</DialogTitle>
        <DialogContent>
          {editProduct && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {editProduct.name} ({editProduct.code})
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Costo actual: ${editProduct.cost.toFixed(2)}
              </Typography>
              <TextField
                fullWidth
                label="Nuevo Costo"
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProduct(null)}>Cancelar</Button>
          <Button
            onClick={handleSaveCost}
            variant="contained"
            disabled={!newCost || updateCostMutation.isLoading}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
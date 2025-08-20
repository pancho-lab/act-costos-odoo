import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  Category as CategoryIcon,
  History as ChangesIcon,
  CloudSync as SyncIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { productsApi, categoriesApi, changesApi, odooApi } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: products } = useQuery('products', () => productsApi.getAll());
  const { data: categories } = useQuery('categories', () => categoriesApi.getWithCounts());
  const { data: pendingChanges } = useQuery('pendingChanges', () => changesApi.getPendingSync());

  const statsCards = [
    {
      title: 'Total Productos',
      value: products && Array.isArray(products.data) ? products.data.length : 0,
      icon: <ProductsIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Categorías',
      value: categories && Array.isArray(categories.data) ? categories.data.length : 0,
      icon: <CategoryIcon fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Cambios Pendientes',
      value: pendingChanges && Array.isArray(pendingChanges.data) ? pendingChanges.data.length : 0,
      icon: <ChangesIcon fontSize="large" />,
      color: '#ed6c02',
    },
  ];

  const handleTestConnection = async () => {
    try {
      const response = await odooApi.testConnection();
      if (response.data.success) {
        alert('Conexión exitosa con Odoo');
      }
    } catch (error) {
      alert('Error al conectar con Odoo');
    }
  };

  const handleSyncData = async () => {
    try {
      await odooApi.syncCategories();
      await odooApi.syncProducts();
      alert('Sincronización completada');
      window.location.reload();
    } catch (error) {
      alert('Error durante la sincronización');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Box display="flex" gap={2} flexDirection="column">
                <Button
                  variant="contained"
                  onClick={handleTestConnection}
                  startIcon={<SyncIcon />}
                >
                  Probar Conexión Odoo
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSyncData}
                  startIcon={<SyncIcon />}
                >
                  Sincronizar Datos desde Odoo
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>
              {pendingChanges?.data && Array.isArray(pendingChanges.data) && pendingChanges.data.length > 0 ? (
                <Alert severity="warning">
                  Tienes {pendingChanges.data.length} cambios pendientes de sincronizar con Odoo
                </Alert>
              ) : (
                <Alert severity="success">
                  Todos los cambios están sincronizados con Odoo
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
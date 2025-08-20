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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  CheckCircle as SyncedIcon,
  Schedule as PendingIcon,
  Edit as ManualIcon,
  Category as BulkIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { changesApi, categoriesApi } from '../services/api';
import { CostChange, Category } from '../types';

const ChangesPage: React.FC = () => {
  const [syncedFilter, setSyncedFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');

  const { data: categories } = useQuery('categories', () => categoriesApi.getAll());
  const { data: changes, isLoading } = useQuery(
    ['changes', syncedFilter, categoryFilter],
    () => {
      const filters: any = {};
      
      if (syncedFilter !== 'all') {
        filters.synced = syncedFilter === 'synced';
      }
      
      if (categoryFilter) {
        filters.categoryId = categoryFilter;
      }
      
      return changesApi.getAll(filters);
    }
  );

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'manual':
        return <ManualIcon fontSize="small" />;
      case 'bulk_category':
        return <BulkIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'manual':
        return 'Manual';
      case 'bulk_category':
        return 'Masivo por Categoría';
      default:
        return changeType;
    }
  };

  const getSyncStatusChip = (synced: boolean) => {
    if (synced) {
      return (
        <Chip
          icon={<SyncedIcon />}
          label="Sincronizado"
          color="success"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<PendingIcon />}
        label="Pendiente"
        color="warning"
        size="small"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historial de Cambios
      </Typography>

      <Box display="flex" gap={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={syncedFilter}
            onChange={(e) => setSyncedFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="synced">Sincronizados</MenuItem>
            <MenuItem value="pending">Pendientes</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as number | '')}
          >
            <MenuItem value="">Todas las categorías</MenuItem>
            {Array.isArray(categories?.data) && categories.data.map((category: Category) => (
              <MenuItem key={category.odoo_id} value={category.odoo_id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => {
            setSyncedFilter('all');
            setCategoryFilter('');
          }}
        >
          Limpiar Filtros
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Costo Anterior</TableCell>
              <TableCell align="right">Costo Nuevo</TableCell>
              <TableCell>Tipo de Cambio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : !changes?.data || !Array.isArray(changes.data) || changes.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron cambios
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(changes.data) && changes.data.map((change: CostChange) => (
                <TableRow key={change.id}>
                  <TableCell>{change.product_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={change.category_name}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${change.old_cost?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 'bold',
                        color: change.new_cost > (change.old_cost || 0) ? 'error.main' : 'success.main',
                      }}
                    >
                      ${change.new_cost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getChangeTypeIcon(change.change_type) || undefined}
                      label={getChangeTypeLabel(change.change_type)}
                      size="small"
                      variant="outlined"
                      color={change.change_type === 'manual' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    {getSyncStatusChip(change.synced_to_odoo)}
                  </TableCell>
                  <TableCell>
                    {new Date(change.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChangesPage;
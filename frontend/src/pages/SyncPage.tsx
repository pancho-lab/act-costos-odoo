import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CloudSync as SyncIcon,
  CloudDownload as ImportIcon,
  CloudUpload as ExportIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { odooApi, changesApi } from '../services/api';

const SyncPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: pendingChanges, isLoading: loadingPending } = useQuery(
    'pendingChanges',
    () => changesApi.getPendingSync()
  );

  const syncFromOdooMutation = useMutation(
    async () => {
      await odooApi.syncCategories();
      await odooApi.syncProducts();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    }
  );

  const syncToOdooMutation = useMutation(
    () => changesApi.syncToOdoo(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingChanges');
      },
    }
  );

  const testConnectionMutation = useMutation(() => odooApi.testConnection());

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sincronización con Odoo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Importar desde Odoo
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Sincroniza productos y categorías desde tu instancia de Odoo a la aplicación local.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={syncFromOdooMutation.isLoading ? <CircularProgress size={20} /> : <ImportIcon />}
                onClick={() => syncFromOdooMutation.mutate()}
                disabled={syncFromOdooMutation.isLoading}
                sx={{ mb: 1 }}
              >
                {syncFromOdooMutation.isLoading ? 'Sincronizando...' : 'Sincronizar desde Odoo'}
              </Button>
              {syncFromOdooMutation.isSuccess && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Sincronización completada exitosamente
                  </Typography>
                </Alert>
              )}
              {syncFromOdooMutation.isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Error durante la sincronización
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exportar a Odoo
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Envía los cambios de costos realizados en la aplicación de vuelta a Odoo.
              </Typography>
              
              {loadingPending ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  {pendingChanges?.data && pendingChanges.data.length > 0 ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Tienes {pendingChanges.data.length} cambios pendientes de sincronizar
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      No hay cambios pendientes
                    </Alert>
                  )}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={syncToOdooMutation.isLoading ? <CircularProgress size={20} /> : <ExportIcon />}
                    onClick={() => syncToOdooMutation.mutate()}
                    disabled={syncToOdooMutation.isLoading || !pendingChanges?.data?.length}
                  >
                    {syncToOdooMutation.isLoading ? 'Sincronizando...' : 'Sincronizar a Odoo'}
                  </Button>
                </>
              )}

              {syncToOdooMutation.isSuccess && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Cambios sincronizados exitosamente a Odoo
                  </Typography>
                </Alert>
              )}
              {syncToOdooMutation.isError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Error al sincronizar cambios a Odoo
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Conexión
              </Typography>
              <Button
                variant="outlined"
                startIcon={testConnectionMutation.isLoading ? <CircularProgress size={20} /> : <SyncIcon />}
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isLoading}
                sx={{ mb: 2 }}
              >
                {testConnectionMutation.isLoading ? 'Probando...' : 'Probar Conexión'}
              </Button>

              {testConnectionMutation.isSuccess && (
                <Alert severity="success">
                  <Typography variant="body2">
                    Conexión exitosa con Odoo
                  </Typography>
                </Alert>
              )}
              {testConnectionMutation.isError && (
                <Alert severity="error">
                  <Typography variant="body2">
                    Error al conectar con Odoo. Verifica tu configuración.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {pendingChanges?.data && pendingChanges.data.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cambios Pendientes de Sincronizar
                </Typography>
                <List dense>
                  {pendingChanges.data.slice(0, 10).map((change: any, index: number) => (
                    <div key={change.id}>
                      <ListItem>
                        <ListItemText
                          primary={change.product_name}
                          secondary={`${change.category_name} - $${change.old_cost?.toFixed(2) || 'N/A'} → $${change.new_cost.toFixed(2)}`}
                        />
                      </ListItem>
                      {index < Math.min(9, pendingChanges.data.length - 1) && <Divider />}
                    </div>
                  ))}
                  {pendingChanges.data.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={`... y ${pendingChanges.data.length - 10} cambios más`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SyncPage;
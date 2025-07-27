import { useState, useCallback } from 'react';
import {
  Input,
  Select,
  Button,
  Typography,
  Space,
  Card,
  Tooltip,
  Checkbox,
  Table,
  Modal,
  Alert,
  Row,
  Col,
} from "antd";
import { 
  PhoneOutlined, 
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { VoterData, FormattedVoterData, Lider } from '../../../../types/votantes';
import { useVoters } from '../../../../hooks/useVoters';
import { LiderService } from '../../../../services/liderService';
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

interface RowData extends Partial<VoterData> {
  id: number;
  isActive: boolean;
  hasData: boolean;
  errors: Record<string, string>;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function BulkVoterRegistration() {
  const { createVoter,  error, clearError } = useVoters();
  const [rows, setRows] = useState<RowData[]>(() => 
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      isActive: false,
      hasData: false,
      errors: {},
      ci: '',
      nombre: '',
      apellido: '',
      telefono: '',
      lider_id: ''
    }))
  );
  
  const [modalVisible, setModalVisible] = useState(false);
  const [rowToDeactivate, setRowToDeactivate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook para líderes con cache inteligente
  const { 
    data: lideres = [], 
    isLoading: loadingLideres,
    error: errorLideres 
  } = useQuery({
    queryKey: ['lideres'],
    queryFn: LiderService.getLideres,
    staleTime: 30 * 60 * 1000, 
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Agrupar líderes por candidato
  const lideresPorCandidato = lideres.reduce((acc, lider) => {
    if (!acc[lider.candidato]) {
      acc[lider.candidato] = [];
    }
    acc[lider.candidato].push(lider);
    return acc;
  }, {} as Record<string, Lider[]>);

  // Validar una fila
  const validateRow = useCallback((rowData: RowData): ValidationResult => {
    const errors: Record<string, string> = {};
    
    if (!rowData.ci) {
      errors.ci = 'CI es requerido';
    } else if (!/^\d+$/.test(rowData.ci)) {
      errors.ci = 'CI debe contener solo números';
    }
    
    if (!rowData.nombre) {
      errors.nombre = 'Nombre es requerido';
    } else if (rowData.nombre.length < 2) {
      errors.nombre = 'Nombre debe tener al menos 2 caracteres';
    }
    
    if (!rowData.apellido) {
      errors.apellido = 'Apellido es requerido';
    } else if (rowData.apellido.length < 2) {
      errors.apellido = 'Apellido debe tener al menos 2 caracteres';
    }
    
    if (!rowData.telefono) {
      errors.telefono = 'Teléfono es requerido';
    } else if (!/^\d{10,11}$/.test(rowData.telefono)) {
      errors.telefono = 'Teléfono debe tener 10 u 11 dígitos';
    }
    
    if (!rowData.lider_id) {
      errors.lider_id = 'Líder es requerido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Verificar si una fila tiene datos
  const checkHasData = useCallback((rowData: RowData): boolean => {
    return !!(rowData.ci || rowData.nombre || rowData.apellido || rowData.telefono || rowData.lider_id);
  }, []);

  // Actualizar una fila
  const updateRow = useCallback(<K extends keyof RowData>(
    rowId: number, 
    field: K, 
    value: RowData[K]
  ) => {
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          const hasData = checkHasData(updatedRow);
          
          return {
            ...updatedRow,
            hasData,
            isActive: hasData ? true : row.isActive,
            errors: {} // Limpiar errores al escribir
          };
        }
        return row;
      });
    });
  }, [checkHasData]);

  // Manejar cambio de checkbox
  const handleCheckboxChange = useCallback((rowId: number, checked: boolean) => {
    const row = rows.find(r => r.id === rowId);
    
    if (!checked && row?.hasData) {
      setRowToDeactivate(rowId);
      setModalVisible(true);
    } else {
      updateRow(rowId, 'isActive', checked);
    }
  }, [rows, updateRow]);

  // Confirmar desactivación
  const confirmDeactivation = useCallback(() => {
    if (rowToDeactivate) {
      // Desactivar y limpiar todos los datos de la fila
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === rowToDeactivate 
            ? { 
                ...row, 
                isActive: false, 
                hasData: false,
                errors: {},
                ci: '', 
                nombre: '', 
                apellido: '', 
                telefono: '', 
                lider_id: '' 
              }
            : row
        )
      );
    }
    setModalVisible(false);
    setRowToDeactivate(null);
  }, [rowToDeactivate]);

  // Generar CI temporal
  const generarCITemporal = useCallback((rowId: number) => {
    const ciTemporal = Math.floor(1000 + Math.random() * 9000).toString();
    updateRow(rowId, 'ci', ciTemporal);
    toast.info(`CI temporal generado para fila ${rowId}: ${ciTemporal}`);
  }, [updateRow]);

  // Establecer teléfono por defecto
  const establecerTelefonoDefault = useCallback((rowId: number) => {
    const telefonoDefault = '0970111222';
    updateRow(rowId, 'telefono', telefonoDefault);
    toast.info(`Teléfono por defecto establecido para fila ${rowId}`);
  }, [updateRow]);

  // Obtener filas válidas para registro
  const getValidRowsForSubmission = useCallback(() => {
    return rows.filter(row => {
      if (!row.isActive) return false;
      const validation = validateRow(row);
      return validation.isValid;
    });
  }, [rows, validateRow]);

  // Manejar envío masivo
  const handleBulkSubmit = useCallback(async () => {
    clearError();
    
    // Primero validar todas las filas activas y mostrar errores
    setRows(prevRows => {
      return prevRows.map(row => {
        if (row.isActive) {
          const validation = validateRow(row);
          return {
            ...row,
            errors: validation.errors
          };
        }
        return row;
      });
    });

    // Esperar un momento para que se actualice el estado
    setTimeout(async () => {
      const validRows = getValidRowsForSubmission();
      
      if (validRows.length === 0) {
        toast.warning('No hay filas válidas para registrar. Revise los errores marcados.');
        return;
      }

      // Verificar CIs duplicados
      const cis = validRows.map(row => row.ci);
      const duplicateCis = cis.filter((ci, index) => cis.indexOf(ci) !== index);
      
      if (duplicateCis.length > 0) {
        toast.error(`CIs duplicados encontrados: ${duplicateCis.join(', ')}`);
        return;
      }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of validRows) {
      try {
        const formattedValues: FormattedVoterData = {
          ci: row.ci!,
          nombre: row.nombre!.toUpperCase(),
          apellido: row.apellido!.toUpperCase(),
          telefono: row.telefono!,
          sexo: 'indefinido' as 'masculino' | 'femenino' | 'indefinido',
          edad: 100,
          barrio: 'CDE',
          lider_id: row.lider_id!
        };

        const result = await createVoter(formattedValues);
        
        if (result.success) {
          successCount++;
          // Limpiar la fila exitosa
          setRows(prevRows => 
            prevRows.map(r => 
              r.id === row.id 
                ? { ...r, ci: '', nombre: '', apellido: '', telefono: '', lider_id: '', isActive: false, hasData: false, errors: {} }
                : r
            )
          );
        } else {
          errorCount++;
          toast.error(`Error en fila ${row.id}: ${result.error}`);
        }
      } catch {
        errorCount++;
        toast.error(`Error inesperado en fila ${row.id}`);
      }
    }

    setIsSubmitting(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} votantes registrados exitosamente`);
    }
    
      if (errorCount > 0) {
        toast.error(`${errorCount} registros fallaron`);
      }
    }, 100); // Cerrar setTimeout
  }, [clearError, getValidRowsForSubmission, createVoter, validateRow]);

  // Columnas de la tabla
  const columns = [
    {
      title: 'Activo',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 70,
      render: (isActive: boolean, record: RowData) => (
        <Checkbox
          checked={isActive}
          onChange={(e) => handleCheckboxChange(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: 'Fila',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id: number) => <Text strong>{id}</Text>,
    },
    {
      title: 'Líder',
      key: 'lider_id',
      width: 250,
      render: (record: RowData) => (
        <div>
          <Select
            placeholder="Seleccionar líder"
            size="small"
            style={{ width: '100%' }}
            value={record.lider_id || undefined}
            onChange={(value) => updateRow(record.id, 'lider_id', value)}
            loading={loadingLideres}
            disabled={isSubmitting}
            status={record.errors.lider_id ? 'error' : undefined}
            showSearch
            filterOption={(input, option) => {
              const label = option?.label || option?.children;
              if (typeof label === 'string') {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {Object.entries(lideresPorCandidato).map(([candidato, lideresGrupo]) => (
              <OptGroup key={candidato} label={`🗳️ ${candidato}`}>
                {lideresGrupo.map((lider) => (
                  <Option 
                    key={lider.id} 
                    value={lider.id}
                    label={`${lider.nombre} ${lider.apellido}`}
                  >
                    {`${lider.nombre} ${lider.apellido} (${lider.ci})`}
                  </Option>
                ))}
              </OptGroup>
            ))}
          </Select>
          {record.errors.lider_id && (
            <Text type="danger" style={{ fontSize: '11px' }}>
              {record.errors.lider_id}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'CI',
      key: 'ci',
      width: 180,
      render: (record: RowData) => (
        <div>
          <Input.Group compact>
            <Input
              size="small"
              style={{ width: 'calc(100% - 60px)' }}
              placeholder="CI"
              value={record.ci}
              onChange={(e) => updateRow(record.id, 'ci', e.target.value)}
              disabled={isSubmitting}
              status={record.errors.ci ? 'error' : undefined}
            />
            <Tooltip title="CI temporal">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => generarCITemporal(record.id)}
                disabled={isSubmitting}
                style={{ width: '60px' }}
              />
            </Tooltip>
          </Input.Group>
          {record.errors.ci && (
            <Text type="danger" style={{ fontSize: '11px' }}>
              {record.errors.ci}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Nombre',
      key: 'nombre',
      width: 150,
      render: (record: RowData) => (
        <div>
          <Input
            size="small"
            placeholder="Nombre"
            value={record.nombre}
            onChange={(e) => updateRow(record.id, 'nombre', e.target.value)}
            disabled={isSubmitting}
            status={record.errors.nombre ? 'error' : undefined}
          />
          {record.errors.nombre && (
            <Text type="danger" style={{ fontSize: '11px' }}>
              {record.errors.nombre}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Apellido',
      key: 'apellido',
      width: 150,
      render: (record: RowData) => (
        <div>
          <Input
            size="small"
            placeholder="Apellido"
            value={record.apellido}
            onChange={(e) => updateRow(record.id, 'apellido', e.target.value)}
            disabled={isSubmitting}
            status={record.errors.apellido ? 'error' : undefined}
          />
          {record.errors.apellido && (
            <Text type="danger" style={{ fontSize: '11px' }}>
              {record.errors.apellido}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Teléfono',
      key: 'telefono',
      width: 180,
      render: (record: RowData) => (
        <div>
          <Input.Group compact>
            <Input
              size="small"
              style={{ width: 'calc(100% - 60px)' }}
              placeholder="Teléfono"
              value={record.telefono}
              onChange={(e) => updateRow(record.id, 'telefono', e.target.value)}
              disabled={isSubmitting}
              status={record.errors.telefono ? 'error' : undefined}
            />
            <Tooltip title="Tel. por defecto">
              <Button
                size="small"
                icon={<PhoneOutlined />}
                onClick={() => establecerTelefonoDefault(record.id)}
                disabled={isSubmitting}
                style={{ width: '60px' }}
              />
            </Tooltip>
          </Input.Group>
          {record.errors.telefono && (
            <Text type="danger" style={{ fontSize: '11px' }}>
              {record.errors.telefono}
            </Text>
          )}
        </div>
      ),
    },
  ];

  const activeRows = rows.filter(row => row.isActive);
  const validRows = getValidRowsForSubmission();
  const hasErrors = rows.some(row => row.isActive && Object.keys(row.errors).length > 0);

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
            Registro Masivo de Votantes
          </Title>
          
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Complete la información de los votantes en la tabla. Los checkboxes se activan automáticamente al escribir.
          </Text>

          {error && (
            <Alert message={error} type="error" showIcon />
          )}

          {errorLideres && (
            <Alert 
              message={`Error al cargar líderes: ${errorLideres.message}`} 
              type="error" 
              showIcon 
            />
          )}

          {/* Estadísticas */}
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Text strong>Filas Activas</Text>
                <br />
                <Text style={{ fontSize: '24px', color: '#1890ff' }}>
                  {activeRows.length}
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Text strong>Filas Válidas</Text>
                <br />
                <Text style={{ fontSize: '24px', color: '#52c41a' }}>
                  {validRows.length}
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Text strong>Con Errores</Text>
                <br />
                <Text style={{ fontSize: '24px', color: '#ff4d4f' }}>
                  {activeRows.length - validRows.length}
                </Text>
              </Card>
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleBulkSubmit}
                loading={isSubmitting}
                disabled={validRows.length === 0 || hasErrors}
                style={{ width: '100%', height: '60px' }}
              >
                Registrar {validRows.length} Votantes
              </Button>
            </Col>
          </Row>

          {hasErrors && (
            <Alert
              message="Hay errores en algunas filas"
              description="Corrija los errores marcados en rojo antes de continuar"
              type="warning"
              showIcon
            />
          )}

          {/* Tabla */}
          <Table
            columns={columns}
            dataSource={rows}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            bordered
            rowClassName={(record) => {
              if (!record.isActive) return 'row-inactive';
              if (Object.keys(record.errors).length > 0) return 'row-error';
              return '';
            }}
          />

          {/* Información adicional */}
          <Card size="small" style={{ backgroundColor: '#f0f9ff', border: '1px solid #91d5ff' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Instrucciones:</strong>
              <br />
              • Los checkboxes se activan automáticamente al escribir en cualquier campo
              <br />
              • Use los botones para generar CI temporal (4 dígitos) y teléfono por defecto
              <br />
              • Solo se registrarán las filas marcadas y sin errores
              <br />
              • <strong>Valores automáticos:</strong> Sexo: Indefinido, Edad: 100, Barrio: CDE
            </Text>
          </Card>
        </Space>
      </Card>

      {/* Modal de confirmación */}
      <Modal
        title="Confirmar Desactivación"
        open={modalVisible}
        onOk={confirmDeactivation}
        onCancel={() => {
          setModalVisible(false);
          setRowToDeactivate(null);
        }}
        okText="Sí, desactivar"
        cancelText="Cancelar"
      >
        <p>
          Esta fila contiene datos. Si la desactiva, no se registrará ningún dato de esta fila.
        </p>
        <p>¿Está seguro de que desea desactivarla?</p>
      </Modal>

      <style>{`
        .row-inactive {
          background-color: #f5f5f5 !important;
          opacity: 0.6 !important;
        }
        .row-error {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </div>
  );
}

export default BulkVoterRegistration;
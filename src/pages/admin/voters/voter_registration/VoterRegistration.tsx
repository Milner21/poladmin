import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Card,
  Tooltip,
} from "antd";
import { 
  UserOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  ReloadOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import type { VoterData, FormattedVoterData, Lider } from '../../../../types/votantes';
import { useVoters } from '../../../../hooks/useVoters';
import { LiderService } from '../../../../services/liderService';
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

function VoterRegistration() {
  const [form] = Form.useForm<VoterData>();
  const { createVoter, loading, error, clearError } = useVoters();
  
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

  // Generar CI temporal aleatorio de 4 dígitos
  const generarCITemporal = () => {
    const ciTemporal = Math.floor(1000 + Math.random() * 9000).toString();
    form.setFieldsValue({ ci: ciTemporal });
    toast.info(`CI temporal generado: ${ciTemporal}`);
  };

  // Establecer teléfono por defecto
  const establecerTelefonoDefault = () => {
    const telefonoDefault = '0970111222';
    form.setFieldsValue({ telefono: telefonoDefault });
    toast.info('Teléfono por defecto establecido');
  };

  const onFinish = async (values: VoterData) => {
    clearError();

    const formattedValues: FormattedVoterData = {
      ...values,
      nombre: values.nombre.toUpperCase(),
      apellido: values.apellido.toUpperCase(),
      sexo: 'indefinido' as 'masculino' | 'femenino' | 'indefinido', // Valor por defecto
      edad: 100, // Valor por defecto
      barrio: 'CDE', // Valor por defecto
      lider_id: values.lider_id
    };
    
    console.log('Enviando datos:', formattedValues);
    
    const result = await createVoter(formattedValues);
    
    if (result.success) {
      toast.success(result.message || 'Votante registrado exitosamente');
      form.resetFields();
      console.log('Votante creado:', result.data);
    } else {
      toast.error(result.error || 'Error al registrar votante');
      console.error('Error:', result.error);
    }
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity<VoterData>) => {
    console.log('Error en validación:', errorInfo);
    toast.warning('Por favor complete todos los campos correctamente');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
            Registro de Votantes
          </Title>
          
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Complete la información del votante
          </Text>

          {error && (
            <Text type="danger" style={{ textAlign: 'center', display: 'block' }}>
              {error}
            </Text>
          )}

          {errorLideres && (
            <Text type="danger" style={{ textAlign: 'center', display: 'block' }}>
              Error al cargar líderes: {errorLideres.message}
            </Text>
          )}

          <Form
            form={form}
            name="voterRegistration"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            style={{ marginTop: 20 }}
          >

            {/* Líder - AHORA AL PRINCIPIO */}
            <Form.Item
              label="Líder que lo invita"
              name="lider_id"
              rules={[{ required: true, message: 'Por favor seleccione el líder que lo invita' }]}
            >
              <Select 
                placeholder="Seleccione el líder que lo invita" 
                size="large"
                loading={loadingLideres}
                disabled={loading || loadingLideres}
                showSearch
                filterOption={(input, option) => {
                  //Verificar tipo y convertir a string de forma segura
                  const label = option?.label || option?.children;
                  if (typeof label === 'string') {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                optionFilterProp="children"
              >
                {Object.entries(lideresPorCandidato).map(([candidato, lideresGrupo]) => (
                  <OptGroup key={candidato} label={`🗳️ ${candidato}`}>
                    {lideresGrupo.map((lider) => (
                      <Option 
                        key={lider.id} 
                        value={lider.id}
                        label={`${lider.nombre} ${lider.apellido} (CI: ${lider.ci})`}
                      >
                        {`${lider.nombre} ${lider.apellido} (CI: ${lider.ci})`}
                      </Option>
                    ))}
                  </OptGroup>
                ))}
              </Select>
            </Form.Item>

            {/* CI - Cédula de Identidad CON BOTÓN TEMPORAL */}
            <Form.Item
              label={
                <Space>
                  CI (Cédula de Identidad)
                  <Tooltip title="Si no conoce la CI, puede generar un número temporal de 4 dígitos para completar el registro">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              name="ci"
              rules={[
                { required: true, message: 'Por favor ingrese su cédula de identidad' },
                { pattern: /^\d+$/, message: 'La cédula debe contener solo números' }
              ]}
            >
              <Input.Group compact>
                <Input 
                  style={{ width: 'calc(100% - 120px)' }}
                  prefix={<IdcardOutlined />} 
                  placeholder="Ej: 12345678 o genere temporal"
                  size="large"
                  disabled={loading}
                />
                <Tooltip title="Generar CI temporal de 4 dígitos">
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    onClick={generarCITemporal}
                    style={{ width: '120px' }}
                    size="large"
                    disabled={loading}
                  >
                    
                  </Button>
                </Tooltip>
              </Input.Group>
            </Form.Item>

            {/* Nombre */}
            <Form.Item
              label="Nombre"
              name="nombre"
              rules={[
                { required: true, message: 'Por favor ingrese su nombre' },
                { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Ingrese su nombre"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Apellido */}
            <Form.Item
              label="Apellido"
              name="apellido"
              rules={[
                { required: true, message: 'Por favor ingrese su apellido' },
                { min: 2, message: 'El apellido debe tener al menos 2 caracteres' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Ingrese su apellido"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Teléfono CON BOTÓN POR DEFECTO */}
            <Form.Item
              label={
                <Space>
                  Teléfono
                  <Tooltip title="Si no conoce el teléfono, puede establecer un número por defecto">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              name="telefono"
              rules={[
                { required: true, message: 'Por favor ingrese su teléfono' },
                { pattern: /^\d{10,11}$/, message: 'El teléfono debe tener 10 u 11 dígitos' }
              ]}
            >
              <Input.Group compact>
                <Input 
                  style={{ width: 'calc(100% - 120px)' }}
                  prefix={<PhoneOutlined />} 
                  placeholder="Ej: 04121234567"
                  size="large"
                  disabled={loading}
                />
                <Tooltip title="Establecer teléfono por defecto (0970111222)">
                  <Button
                    type="default"
                    icon={<PhoneOutlined />}
                    onClick={establecerTelefonoDefault}
                    style={{ width: '120px' }}
                    size="large"
                    disabled={loading}
                  >
                    Por Defecto
                  </Button>
                </Tooltip>
              </Input.Group>
            </Form.Item>

            {/* Información del líder seleccionado */}
            <Form.Item shouldUpdate={(prevValues, currentValues) => 
              prevValues.lider_id !== currentValues.lider_id
            }>
              {({ getFieldValue }) => {
                const liderId = getFieldValue('lider_id');
                const liderSeleccionado = lideres.find(lider => lider.id === liderId);
                
                if (liderSeleccionado) {
                  return (
                    <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                      <Text strong>Líder seleccionado:</Text>
                      <br />
                      <Text>{liderSeleccionado.nombre} {liderSeleccionado.apellido}</Text>
                      <br />
                      <Text type="secondary">Candidato: {liderSeleccionado.candidato}</Text>
                      <br />
                      <Text type="secondary">CI: {liderSeleccionado.ci}</Text>
                      {liderSeleccionado.telefono && (
                        <>
                          <br />
                          <Text type="secondary">Teléfono: {liderSeleccionado.telefono}</Text>
                        </>
                      )}
                    </Card>
                  );
                }
                return null;
              }}
            </Form.Item>

            {/* Botón de envío */}
            <Form.Item style={{ marginTop: 30 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Registrando...' : 'Registrar Votante'}
              </Button>
            </Form.Item>
          </Form>

          {/* Información adicional */}
          <Card size="small" style={{ backgroundColor: '#f0f9ff', border: '1px solid #91d5ff' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Nota:</strong> Los datos temporales (CI de 4 dígitos y teléfonos por defecto) 
              pueden ser actualizados posteriormente con la información real del votante.
              <br />
              <strong>Valores automáticos:</strong> Sexo: Indefinido, Edad: 100, Barrio: CDE
            </Text>
          </Card>
        </Space>
      </Card>
    </div>
  );
}

export default VoterRegistration;
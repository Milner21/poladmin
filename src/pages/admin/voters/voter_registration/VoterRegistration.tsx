import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Card,
} from "antd";
import { UserOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
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

  const onFinish = async (values: VoterData) => {
    clearError();

    const formattedValues: FormattedVoterData = {
      ...values,
      nombre: values.nombre.toUpperCase(),
      apellido: values.apellido.toUpperCase(),
      sexo: values.sexo.toUpperCase(),
      barrio: values.barrio.toUpperCase(),
      lider_id: values.lider_id // ← ID del líder
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
            Todos los campos son obligatorios y deben ser completados de manera correcta
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
            {/* CI - Cédula de Identidad */}
            <Form.Item
              label="CI (Cédula de Identidad)"
              name="ci"
              rules={[
                { required: true, message: 'Por favor ingrese su cédula de identidad' },
                { pattern: /^\d+$/, message: 'La cédula debe contener solo números' }
              ]}
            >
              <Input 
                prefix={<IdcardOutlined />} 
                placeholder="Ej: 12345678"
                size="large"
                disabled={loading}
              />
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

            {/* Teléfono */}
            <Form.Item
              label="Teléfono"
              name="telefono"
              rules={[
                { required: true, message: 'Por favor ingrese su teléfono' },
                { pattern: /^\d{10,11}$/, message: 'El teléfono debe tener 10 u 11 dígitos' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="Ej: 04121234567"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Sexo */}
            <Form.Item
              label="Sexo"
              name="sexo"
              rules={[{ required: true, message: 'Por favor seleccione su sexo' }]}
            >
              <Select 
                placeholder="Seleccione su sexo" 
                size="large"
                disabled={loading}
              >
                <Option value="masculino">Masculino</Option>
                <Option value="femenino">Femenino</Option>
              </Select>
            </Form.Item>

            {/* Edad */}
            <Form.Item
              label="Edad"
              name="edad"
              rules={[
                { required: true, message: 'Por favor ingrese su edad' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const age = parseInt(value);
                    if (age < 18 || age > 120) {
                      return Promise.reject(new Error('La edad debe estar entre 18 y 120 años'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input 
                type="number" 
                placeholder="Ingrese su edad"
                size="large"
                min={18}
                max={120}
                disabled={loading}
              />
            </Form.Item>

            {/* Barrio */}
            <Form.Item
              label="Barrio de Residencia"
              name="barrio"
              rules={[
                { required: true, message: 'Por favor ingrese su barrio de residencia' },
                { min: 3, message: 'El barrio debe tener al menos 3 caracteres' }
              ]}
            >
              <Input 
                placeholder="Ingrese el barrio donde reside"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            {/* Líder */}
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
        </Space>
      </Card>
    </div>
  );
}

export default VoterRegistration;
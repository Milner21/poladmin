import { Form, Input, Select, Button, Typography, Space, Card, message } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import type { VoterData, FormattedVoterData } from '../../../../types/votantes';
import { useVoters } from '../../../../hooks/useVoters';

const { Title, Text } = Typography;
const { Option } = Select;

function VoterRegistration() {
  const [form] = Form.useForm<VoterData>();
  const { createVoter, loading, clearError } = useVoters();

  const onFinish = async (values: VoterData) => {
    // Limpiar errores previos
    clearError();

    // Convertir campos de texto a mayúsculas antes de enviar
    const formattedValues: FormattedVoterData = {
      ...values,
      nombre: values.nombre.toUpperCase(),
      apellido: values.apellido.toUpperCase(),
      sexo: values.sexo.toUpperCase(),
      barrio: values.barrio.toUpperCase()
    };
    
    console.log('Enviando datos:', formattedValues);
    
    // Llamar al hook para crear el votante
    const result = await createVoter(formattedValues);
    
    if (result.success) {
      message.success(result.message || 'Votante registrado exitosamente');
      form.resetFields(); // Limpiar formulario
      console.log('Votante creado:', result.data);
    } else {
      message.error(result.error || 'Error al registrar votante');
      console.error('Error:', result.error);
    }
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity<VoterData>) => {
    console.log('Error en validación:', errorInfo);
    message.warning('Por favor complete todos los campos correctamente');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Título */}
          <Title level={2} style={{ textAlign: 'center', marginBottom: 0 }}>
            Registro de Votantes
          </Title>
          
          {/* Subtítulo explicativo */}
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            Todos los campos son obligatorios y deben ser completados de manera correcta
          </Text>

          {/* Formulario */}
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
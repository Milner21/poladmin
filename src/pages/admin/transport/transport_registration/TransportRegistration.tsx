import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Card,
  message,
  Steps,
  Radio,
  Table,
  Modal,
  InputNumber,
  Tag,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { TransporteData, Candidato } from "../../../../types/transpotes";
import type {
  VoterData,
  FormattedVoterData,
  Lider,
} from "../../../../types/votantes";
import { LiderService } from "../../../../services/liderService";
import { CandidatoService } from "../../../../services/candidatoService";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;
const { Step } = Steps;

function TransportRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<TransporteData>();
  const [voterForm] = Form.useForm<VoterData>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [votantes, setVotantes] = useState<FormattedVoterData[]>([]);
  const [selectedLider, setSelectedLider] = useState<Lider | null>(null);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(
    null
  );

  // Hooks para datos
  const { data: lideres = [], isLoading: loadingLideres } = useQuery({
    queryKey: ["lideres"],
    queryFn: LiderService.getLideres,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: candidatos = [], isLoading: loadingCandidatos } = useQuery({
    queryKey: ["candidatos"],
    queryFn: CandidatoService.getCandidatos,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Agrupar líderes por candidato
  const lideresPorCandidato = lideres.reduce((acc, lider) => {
    if (!acc[lider.candidato]) {
      acc[lider.candidato] = [];
    }
    acc[lider.candidato].push(lider);
    return acc;
  }, {} as Record<string, Lider[]>);

  // Columnas de la tabla de votantes
  const columns = [
    {
      title: "CI",
      dataIndex: "ci",
      key: "ci",
      width: 100,
    },
    {
      title: "Nombre Completo",
      key: "nombre_completo",
      render: (record: FormattedVoterData) =>
        `${record.nombre} ${record.apellido}`,
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: 120,
    },
    {
      title: "Edad",
      dataIndex: "edad",
      key: "edad",
      width: 80,
    },
    {
      title: "Sexo",
      dataIndex: "sexo",
      key: "sexo",
      width: 100,
      render: (sexo: string) => (
        <Tag color={sexo === "MASCULINO" ? "blue" : "pink"}>{sexo}</Tag>
      ),
    },
    {
      title: "Barrio",
      dataIndex: "barrio",
      key: "barrio",
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      render: (record: FormattedVoterData) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => eliminarVotante(record.ci)}
        />
      ),
    },
  ];

  // Manejar cambio de tipo de contrato
  const handleTipoContratoChange = (value: "lider" | "candidato") => {
    form.setFieldsValue({
      tipo_contrato: value,
      lider_id: undefined,
      candidato_id: undefined,
    });
    setSelectedLider(null);
    setSelectedCandidato(null);
  };

  // Manejar selección de líder
  const handleLiderChange = (liderId: string) => {
    const lider = lideres.find((l) => l.id === liderId);
    setSelectedLider(lider || null);
  };

  // Manejar selección de candidato
  const handleCandidatoChange = (candidatoId: string) => {
    const candidato = candidatos.find((c) => c.id === candidatoId);
    setSelectedCandidato(candidato || null);
  };

  // Siguiente paso
  const nextStep = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch {
      message.warning("Por favor complete todos los campos correctamente");
    }
  };

  // Paso anterior
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Abrir modal para agregar votante
  const abrirModalVotante = () => {
    voterForm.resetFields();

    // Pre-llenar el líder si está seleccionado
    if (selectedLider) {
      voterForm.setFieldsValue({ lider_id: selectedLider.id });
    }

    setModalVisible(true);
  };

  // Agregar votante
  const agregarVotante = async (values: VoterData) => {
    const formattedValues: FormattedVoterData = {
      ...values,
      nombre: values.nombre.toUpperCase(),
      apellido: values.apellido.toUpperCase(),
      sexo: values.sexo.toUpperCase(),
      barrio: values.barrio.toUpperCase(),
      lider_id: selectedLider?.id || selectedCandidato?.id || "",
    };

    // Verificar si ya existe
    const existe = votantes.some((v) => v.ci === formattedValues.ci);
    if (existe) {
      message.error("Ya existe un votante con esta cédula");
      return;
    }

    setVotantes([...votantes, formattedValues]);
    setModalVisible(false);
    message.success("Votante agregado exitosamente");
  };

  // Eliminar votante
  const eliminarVotante = (ci: string) => {
    setVotantes(votantes.filter((v) => v.ci !== ci));
    message.success("Votante eliminado");
  };

  // Guardar registro completo
  const guardarRegistro = async () => {
    try {
      setLoading(true);
      const formValues = await form.validateFields();

      if (votantes.length === 0) {
        message.warning("Debe agregar al menos un votante");
        return;
      }

      const transporteData: TransporteData = {
        ...formValues,
        votantes: votantes.map((v) => ({
          ...v,
          sexo: v.sexo.toLowerCase() as "masculino" | "femenino",
        })),
      };

      console.log("Guardando transporte:", transporteData);

      // Aquí iría la llamada al servicio
      // await TransporteService.createTransporte(transporteData);

      message.success("Transporte registrado exitosamente");

      // Reset form
      form.resetFields();
      setVotantes([]);
      setCurrentStep(0);
      setSelectedLider(null);
      setSelectedCandidato(null);
    } catch (error) {
      message.error("Error al registrar el transporte");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4}>Información del Contrato</Title>

            <Form.Item
              label="Tipo de Contrato"
              name="tipo_contrato"
              rules={[
                { required: true, message: "Seleccione el tipo de contrato" },
              ]}
            >
              <Radio.Group
                onChange={(e) => handleTipoContratoChange(e.target.value)}
              >
                <Radio value="lider">Contratado por Líder</Radio>
                <Radio value="candidato">
                  Contratado Directamente por Candidato
                </Radio>
              </Radio.Group>
            </Form.Item>

            {form.getFieldValue("tipo_contrato") === "lider" && (
              <Form.Item
                label="Seleccionar Líder"
                name="lider_id"
                rules={[{ required: true, message: "Seleccione un líder" }]}
              >
                <Select
                  placeholder="Seleccione el líder"
                  size="large"
                  loading={loadingLideres}
                  showSearch
                  onChange={handleLiderChange}
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {Object.entries(lideresPorCandidato).map(
                    ([candidato, lideresGrupo]) => (
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
                    )
                  )}
                </Select>
              </Form.Item>
            )}

            {form.getFieldValue("tipo_contrato") === "candidato" && (
              <Form.Item
                label="Seleccionar Candidato"
                name="candidato_id"
                rules={[{ required: true, message: "Seleccione un candidato" }]}
              >
                <Select
                  placeholder="Seleccione el candidato"
                  size="large"
                  loading={loadingCandidatos}
                  showSearch
                  onChange={handleCandidatoChange}
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children;
                    if (typeof label === "string") {
                      return label.toLowerCase().includes(input.toLowerCase());
                    }
                    return false;
                  }}
                >
                  {candidatos.map((candidato) => (
                    <Option
                      key={candidato.id}
                      value={candidato.id}
                      label={`${candidato.nombre} ${candidato.apellido} - ${candidato.partido}`}
                    >
                      {`${candidato.nombre} ${candidato.apellido} - ${candidato.partido}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {(selectedLider || selectedCandidato) && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#f6ffed",
                  border: "1px solid #b7eb8f",
                }}
              >
                <Text strong>
                  {selectedLider
                    ? "Líder seleccionado:"
                    : "Candidato seleccionado:"}
                </Text>
                <br />
                <Text>
                  {selectedLider
                    ? `${selectedLider.nombre} ${selectedLider.apellido}`
                    : `${selectedCandidato?.nombre} ${selectedCandidato?.apellido}`}
                </Text>
                <br />
                <Text type="secondary">
                  {selectedLider
                    ? `Candidato: ${selectedLider.candidato}`
                    : `Partido: ${selectedCandidato?.partido}`}
                </Text>
              </Card>
            )}
          </Space>
        );

      case 1:
        return (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={4}>Datos del Conductor y Vehículo</Title>

            {/* Datos del Conductor */}
            <Card title="Información del Conductor" size="small">
              <Form.Item
                label="CI del Conductor"
                name="conductor_ci"
                rules={[
                  {
                    required: true,
                    message: "Ingrese la cédula del conductor",
                  },
                  {
                    pattern: /^\d+$/,
                    message: "La cédula debe contener solo números",
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="Ej: 12345678"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Nombre del Conductor"
                name="conductor_nombre"
                rules={[
                  {
                    required: true,
                    message: "Ingrese el nombre del conductor",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nombre"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Apellido del Conductor"
                name="conductor_apellido"
                rules={[
                  {
                    required: true,
                    message: "Ingrese el apellido del conductor",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Apellido"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Teléfono del Conductor"
                name="conductor_telefono"
                rules={[
                  {
                    required: true,
                    message: "Ingrese el teléfono del conductor",
                  },
                  {
                    pattern: /^\d{10,11}$/,
                    message: "El teléfono debe tener 10 u 11 dígitos",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Ej: 04121234567"
                  size="large"
                />
              </Form.Item>
            </Card>

            {/* Datos del Vehículo */}
            <Card title="Información del Vehículo" size="small">
              <Form.Item
                label="Tipo de Vehículo"
                name="vehiculo_tipo"
                rules={[
                  { required: true, message: "Seleccione el tipo de vehículo" },
                ]}
              >
                <Select placeholder="Seleccione el tipo" size="large">
                  <Option value="carro">🚗 Carro</Option>
                  <Option value="moto">🏍️ Moto</Option>
                  <Option value="autobus">🚌 Autobús</Option>
                  <Option value="camioneta">🚐 Camioneta</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Placa del Vehículo"
                name="vehiculo_placa"
                rules={[
                  { required: true, message: "Ingrese la placa del vehículo" },
                ]}
              >
                <Input
                  prefix={<CarOutlined />}
                  placeholder="Ej: ABC123"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Marca"
                name="vehiculo_marca"
                rules={[
                  { required: true, message: "Ingrese la marca del vehículo" },
                ]}
              >
                <Input placeholder="Ej: Toyota" size="large" />
              </Form.Item>

              <Form.Item
                label="Modelo"
                name="vehiculo_modelo"
                rules={[
                  { required: true, message: "Ingrese el modelo del vehículo" },
                ]}
              >
                <Input placeholder="Ej: Corolla" size="large" />
              </Form.Item>

              <Form.Item
                label="Color"
                name="vehiculo_color"
                rules={[
                  { required: true, message: "Ingrese el color del vehículo" },
                ]}
              >
                <Input placeholder="Ej: Blanco" size="large" />
              </Form.Item>

              <Form.Item
                label="Capacidad de Pasajeros"
                name="capacidad_pasajeros"
                rules={[
                  {
                    required: true,
                    message: "Ingrese la capacidad de pasajeros",
                  },
                  {
                    type: "number",
                    min: 1,
                    max: 50,
                    message: "La capacidad debe estar entre 1 y 50",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Ej: 4"
                  size="large"
                  min={1}
                  max={50}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Space>
        );

      case 2:
        return (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={4}>Registro de Votantes ({votantes.length})</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={abrirModalVotante}
              >
                Agregar Votante
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={votantes}
              rowKey="ci"
              pagination={false}
              locale={{ emptyText: "No hay votantes registrados" }}
              scroll={{ x: 800 }}
            />

            {votantes.length > 0 && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#e6f7ff",
                  border: "1px solid #91d5ff",
                }}
              >
                <Text strong>Resumen:</Text>
                <br />
                <Text>Total de votantes: {votantes.length}</Text>
                <br />
                <Text>
                  Capacidad del vehículo:{" "}
                  {form.getFieldValue("capacidad_pasajeros") || 0}
                </Text>
                <br />
                <Text
                  type={
                    votantes.length <=
                    (form.getFieldValue("capacidad_pasajeros") || 0)
                      ? "success"
                      : "danger"
                  }
                >
                  {votantes.length <=
                  (form.getFieldValue("capacidad_pasajeros") || 0)
                    ? "✅ Capacidad suficiente"
                    : "⚠️ Excede la capacidad del vehículo"}
                </Text>
              </Card>
            )}
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 0 }}>
            Registro de Transporte
          </Title>

          <Steps current={currentStep} style={{ marginBottom: 30 }}>
            <Step title="Contrato" description="Líder o Candidato" />
            <Step title="Datos" description="Conductor y Vehículo" />
            <Step title="Votantes" description="Registro de Pasajeros" />
          </Steps>

          <Form form={form} layout="vertical" autoComplete="off">
            {renderStepContent()}
          </Form>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 30,
            }}
          >
            <Button
              size="large"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStep < 2 ? (
              <Button type="primary" size="large" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={guardarRegistro}
                disabled={votantes.length === 0}
              >
                Guardar Registro
              </Button>
            )}
          </div>
        </Space>
      </Card>

      {/* Modal para agregar votante */}
      <Modal
        title="Agregar Votante"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={voterForm}
          layout="vertical"
          onFinish={agregarVotante}
          autoComplete="off"
        >
          <Form.Item
            label="CI (Cédula de Identidad)"
            name="ci"
            rules={[
              {
                required: true,
                message: "Por favor ingrese la cédula de identidad",
              },
              {
                pattern: /^\d+$/,
                message: "La cédula debe contener solo números",
              },
            ]}
          >
            <Input
              prefix={<IdcardOutlined />}
              placeholder="Ej: 12345678"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ingrese el nombre"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="apellido"
            rules={[
              { required: true, message: "Por favor ingrese el apellido" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ingrese el apellido"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[
              { required: true, message: "Por favor ingrese el teléfono" },
              {
                pattern: /^\d{10,11}$/,
                message: "El teléfono debe tener 10 u 11 dígitos",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Ej: 04121234567"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Sexo"
            name="sexo"
            rules={[
              { required: true, message: "Por favor seleccione el sexo" },
            ]}
          >
            <Select placeholder="Seleccione el sexo" size="large">
              <Option value="masculino">Masculino</Option>
              <Option value="femenino">Femenino</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Edad"
            name="edad"
            rules={[
              { required: true, message: "Por favor ingrese la edad" },
              {
                type: "number",
                min: 18,
                max: 120,
                message: "La edad debe estar entre 18 y 120 años",
              },
            ]}
          >
            <InputNumber
              placeholder="Ingrese la edad"
              size="large"
              min={18}
              max={120}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Barrio de Residencia"
            name="barrio"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el barrio de residencia",
              },
            ]}
          >
            <Input placeholder="Ingrese el barrio donde reside" size="large" />
          </Form.Item>

          {/* Campo oculto para el líder (se llena automáticamente) */}
          <Form.Item name="lider_id" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <Button onClick={() => setModalVisible(false)}>Cancelar</Button>
            <Button type="primary" htmlType="submit">
              Agregar Votante
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default TransportRegistration;

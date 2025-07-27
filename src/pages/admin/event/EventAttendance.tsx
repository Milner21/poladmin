import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Card,
  message,
  Modal,
  Tag,
  Statistic,
  Row,
  Col,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import type { VotanteParaEvento } from "../../../types/eventos";
import { EventoService } from "../../../services/eventoService";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

function EventAttendance() {
  const [selectedEvento, setSelectedEvento] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVotante, setSelectedVotante] =
    useState<VotanteParaEvento | null>(null);
  const queryClient = useQueryClient();

  // Hook para eventos
  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ["eventos"],
    queryFn: EventoService.getEventos,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Hook para votantes del evento seleccionado
  const {
    data: votantes = [],
    isLoading: loadingVotantes,
    refetch: refetchVotantes,
  } = useQuery({
    queryKey: ["votantes-evento", selectedEvento, searchTerm],
    queryFn: () =>
      EventoService.getVotantesParaEvento(selectedEvento, searchTerm),
    enabled: !!selectedEvento,
    staleTime: 30 * 1000, // 30 segundos para datos más frescos
    gcTime: 2 * 60 * 1000,
  });

  // Hook para asistencias del evento
  const { data: asistencias = [] } = useQuery({
    queryKey: ["asistencias-evento", selectedEvento],
    queryFn: () => EventoService.getAsistenciasEvento(selectedEvento),
    enabled: !!selectedEvento,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  // Mutación para registrar asistencia
  const registrarAsistenciaMutation = useMutation({
    mutationFn: (votante: VotanteParaEvento) =>
      EventoService.registrarAsistencia(selectedEvento, votante),
    onSuccess: (result) => {
      if (result.success) {
        message.success(result.message);
        setModalVisible(false);
        setSelectedVotante(null);
        // Refrescar datos
        queryClient.invalidateQueries({
          queryKey: ["votantes-evento", selectedEvento],
        });
        queryClient.invalidateQueries({
          queryKey: ["asistencias-evento", selectedEvento],
        });
      } else {
        message.error(result.error);
      }
    },
    onError: () => {
      message.error("Error al registrar la asistencia");
    },
  });

  // Evento seleccionado actual
  const eventoActual = eventos.find((e) => e.id === selectedEvento);

  // Estadísticas
  const totalVotantes = votantes.length;
  const totalAsistencias = asistencias.length;
  const porcentajeAsistencia =
    totalVotantes > 0
      ? ((totalAsistencias / totalVotantes) * 100).toFixed(1)
      : "0";

  // Columnas de la tabla
  const columns: ColumnsType<VotanteParaEvento> = [
    {
      title: "Estado",
      key: "estado",
      width: 80,
      render: (record: VotanteParaEvento) =>
        record.ya_asistio ? (
          <Badge status="success" />
        ) : (
          <Badge status="default" />
        ),
    },
    {
      title: "CI",
      dataIndex: "ci",
      key: "ci",
      width: 100,
      sorter: (a, b) => a.ci.localeCompare(b.ci),
    },
    {
      title: "Nombre Completo",
      key: "nombre_completo",
      render: (record: VotanteParaEvento) => (
        <div>
          <Text strong>{`${record.nombre} ${record.apellido}`}</Text>
          {record.ya_asistio && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              ✓ Asistió
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) =>
        `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`),
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: 120,
    },
    {
      title: "Barrio",
      dataIndex: "barrio",
      key: "barrio",
      sorter: (a, b) => a.barrio.localeCompare(b.barrio),
    },
    {
      title: "Sexo",
      dataIndex: "sexo",
      key: "sexo",
      width: 80,
      render: (sexo: string) => (
        <Tag color={sexo === "MASCULINO" ? "blue" : "pink"}>{sexo}</Tag>
      ),
    },
    {
      title: "Edad",
      dataIndex: "edad",
      key: "edad",
      width: 70,
      sorter: (a, b) => a.edad - b.edad,
    },
  ];

  // Manejar clic en fila
  const handleRowClick = (record: VotanteParaEvento) => {
    if (record.ya_asistio) {
      message.info("Este votante ya está registrado en el evento");
      return;
    }
    setSelectedVotante(record);
    setModalVisible(true);
  };

  // Confirmar asistencia
  const confirmarAsistencia = () => {
    if (selectedVotante) {
      registrarAsistenciaMutation.mutate(selectedVotante);
    }
  };

  // Buscar con delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedEvento) {
        refetchVotantes();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedEvento, refetchVotantes]);

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: 0 }}>
            <CalendarOutlined /> Control de Asistencia a Eventos
          </Title>

          {/* Selector de evento */}
          <Card size="small" title="Seleccionar Evento">
            <Select
              placeholder="Seleccione un evento"
              size="large"
              style={{ width: "100%" }}
              loading={loadingEventos}
              value={selectedEvento || undefined}
              onChange={setSelectedEvento}
              showSearch
              filterOption={(input, option) => {
                const label = option?.label || option?.children;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {eventos.map((evento) => (
                <Option key={evento.id} value={evento.id}>
                  {`${evento.nombre} - ${evento.fecha_evento} ${evento.hora_evento}`}
                </Option>
              ))}
            </Select>

            {eventoActual && (
              <Card
                size="small"
                style={{ marginTop: 16, backgroundColor: "#f6ffed" }}
              >
                <Text strong>Evento seleccionado:</Text>
                <br />
                <Text>{eventoActual.nombre}</Text>
                <br />
                <Text type="secondary">
                  📅 {eventoActual.fecha_evento} a las{" "}
                  {eventoActual.hora_evento}
                </Text>
                {eventoActual.lugar && (
                  <>
                    <br />
                    <Text type="secondary">📍 {eventoActual.lugar}</Text>
                  </>
                )}
              </Card>
            )}
          </Card>

          {selectedEvento && (
            <>
              {/* Estadísticas */}
              <Row gutter={16}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Total Votantes"
                      value={totalVotantes}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Asistencias"
                      value={totalAsistencias}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="Pendientes"
                      value={totalVotantes - totalAsistencias}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: "#cf1322" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="% Asistencia"
                      value={porcentajeAsistencia}
                      suffix="%"
                      valueStyle={{
                        color:
                          parseFloat(porcentajeAsistencia) >= 70
                            ? "#3f8600"
                            : "#cf1322",
                      }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Búsqueda */}
              <Card size="small" title="Buscar Votantes">
                <Search
                  placeholder="Buscar por CI, nombre, apellido o barrio..."
                  size="large"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </Card>

              {/* Tabla de votantes */}
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    Lista de Votantes
                    <Text type="secondary">
                      ({votantes.length} encontrados)
                    </Text>
                  </Space>
                }
              >
                <Table
                  columns={columns}
                  dataSource={votantes}
                  rowKey="id"
                  loading={loadingVotantes}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} votantes`,
                  }}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: {
                      cursor: "pointer",
                      backgroundColor: record.ya_asistio
                        ? "#f6ffed"
                        : undefined,
                    },
                  })}
                  scroll={{ x: 800 }}
                  locale={{
                    emptyText: selectedEvento
                      ? "No se encontraron votantes"
                      : "Seleccione un evento para ver los votantes",
                  }}
                />
              </Card>
            </>
          )}
        </Space>
      </Card>

      {/* Modal de confirmación de asistencia */}
      <Modal
        title="Confirmar Asistencia"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedVotante(null);
        }}
        footer={null}
        width={500}
      >
        {selectedVotante && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <Title level={4}>¿Asistió al evento?</Title>
            </div>

            <Card size="small" style={{ backgroundColor: "#f0f2f5" }}>
              <Text strong>Información del Votante:</Text>
              <br />
              <Text>CI: {selectedVotante.ci}</Text>
              <br />
              <Text>
                Nombre: {selectedVotante.nombre} {selectedVotante.apellido}
              </Text>
              <br />
              <Text>Teléfono: {selectedVotante.telefono}</Text>
              <br />
              <Text>Barrio: {selectedVotante.barrio}</Text>
            </Card>

            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <Button
                size="large"
                onClick={() => {
                  setModalVisible(false);
                  setSelectedVotante(null);
                }}
              >
                <CloseCircleOutlined /> No
              </Button>
              <Button
                type="primary"
                size="large"
                loading={registrarAsistenciaMutation.isPending}
                onClick={confirmarAsistencia}
                autoFocus
              >
                <CheckCircleOutlined /> Sí, Asistió
              </Button>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}

export default EventAttendance;

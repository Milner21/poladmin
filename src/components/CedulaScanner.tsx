/*import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { 
  Button, 
  Form, 
  Input, 
  Card, 
  Row, 
  Col, 
  Spin, 
  message
} from "antd";
import { CameraOutlined, ScanOutlined } from "@ant-design/icons";
import Tesseract from "tesseract.js";

const CedulaScanner = () => {
  const webcamRef = useRef(null);
  const [form] = Form.useForm();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Función para capturar la imagen
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
    message.success("Imagen capturada correctamente");
  };

  // Función para procesar la imagen con OCR
  const processImage = async () => {
    if (!capturedImage) {
      message.error("Primero debes capturar una imagen");
      return;
    }

    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        capturedImage,
        "spa",
        {
          logger: (m) => {
            if (m.status === "recognizing text") {
              console.log(`Progreso: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log("Texto extraído:", text);
      
      // Parsear el texto y extraer datos
      const extractedData = parseDocumentText(text);
      
      // Autocompletar el formulario
      form.setFieldsValue(extractedData);
      
      message.success("Datos extraídos y formulario completado");
    } catch (error) {
      console.error("Error en OCR:", error);
      message.error("Error al procesar la imagen");
    } finally {
      setIsScanning(false);
    }
  };

  // Función para parsear el texto extraído
  const parseDocumentText = (text) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const extractedData = {};

    lines.forEach(line => {
      // Buscar número de cédula (ejemplo: 12345678 o 12.345.678)
      const cedulaMatch = line.match(/(\d{1,2}\.?\d{3}\.?\d{3})/);
      if (cedulaMatch && !extractedData.cedula) {
        extractedData.cedula = cedulaMatch[1].replace(/\./g, '');
      }

      // Buscar nombres (líneas que contienen solo letras y espacios)
      if (/^[A-ZÁÉÍÓÚÑ\s]+$/.test(line) && line.length > 3 && !extractedData.nombre) {
        extractedData.nombre = line;
      }

      // Buscar fecha de nacimiento (formato DD/MM/YYYY o DD-MM-YYYY)
      const fechaMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (fechaMatch && !extractedData.fechaNacimiento) {
        extractedData.fechaNacimiento = `${fechaMatch[1]}/${fechaMatch[2]}/${fechaMatch[3]}`;
      }

      // Buscar sexo
      if ((line.includes('M') || line.includes('F')) && line.length < 5 && !extractedData.sexo) {
        extractedData.sexo = line.includes('F') ? 'F' : 'M';
      }
    });

    return extractedData;
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {/* Sección de captura *//*}
        <Col xs={24} lg={12}>
          <Card title="Captura de Cédula" style={{ height: '100%' }}>
            {!showCamera ? (
              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />}
                  size="large"
                  onClick={() => setShowCamera(true)}
                  style={{ marginBottom: 16 }}
                >
                  Abrir Cámara
                </Button>
                
                {capturedImage && (
                  <div>
                    <img 
                      src={capturedImage} 
                      alt="Cédula capturada" 
                      style={{ 
                        width: '100%', 
                        maxWidth: 350, 
                        border: '2px solid #d9d9d9',
                        borderRadius: 8,
                        marginBottom: 16
                      }} 
                    />
                    <br />
                    <Button 
                      type="primary" 
                      icon={<ScanOutlined />}
                      loading={isScanning}
                      onClick={processImage}
                      size="large"
                    >
                      {isScanning ? 'Escaneando...' : 'Escanear Documento'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={350}
                    height={220}
                    videoConstraints={{ 
                      facingMode: "environment",
                      width: 1280,
                      height: 720
                    }}
                    style={{ borderRadius: 8 }}
                  />
                  {/* Marco guía para la cédula *//*}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '90%',
                      height: '70%',
                      border: '3px solid #1890ff',
                      borderRadius: 12,
                      pointerEvents: 'none',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '12px'
                    }}
                  >
                    Coloca la cédula dentro del marco
                  </div>
                </div>
                <br />
                <Button 
                  type="primary" 
                  onClick={captureImage}
                  size="large"
                  style={{ marginTop: 16, marginRight: 8 }}
                >
                  Capturar
                </Button>
                <Button 
                  onClick={() => setShowCamera(false)}
                  size="large"
                  style={{ marginTop: 16 }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </Card>
        </Col>

        {/* Formulario *//*}
        <Col xs={24} lg={12}>
          <Card title="Datos Extraídos" style={{ height: '100%' }}>
            <Spin spinning={isScanning} tip="Procesando imagen...">
              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => {
                  console.log('Datos del formulario:', values);
                  message.success('Formulario enviado correctamente');
                }}
              >
                <Form.Item
                  label="Número de Cédula"
                  name="cedula"
                  rules={[{ required: true, message: 'Ingrese el número de cédula' }]}
                >
                  <Input placeholder="Ej: 12345678" />
                </Form.Item>

                <Form.Item
                  label="Nombre Completo"
                  name="nombre"
                  rules={[{ required: true, message: 'Ingrese el nombre completo' }]}
                >
                  <Input placeholder="Nombre y apellidos" />
                </Form.Item>

                <Form.Item
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                >
                  <Input placeholder="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                  label="Sexo"
                  name="sexo"
                >
                  <Input placeholder="M/F" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Guardar Datos
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CedulaScanner;*/
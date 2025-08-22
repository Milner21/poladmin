import { Button, Result } from "antd";
import { useNavigate } from "react-router";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      width: "100vw",
      padding: "20px"
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Lo sentimos, la página que estás buscando no existe."
        extra={[
          <Button 
            type="primary" 
            key="back" 
            icon={<ArrowLeftOutlined />}
            onClick={goBack}
            style={{ marginRight: "8px" }}
          >
            Regresar Atrás
          </Button>,
          <Button 
            key="home" 
            icon={<HomeOutlined />}
            onClick={goHome}
          >
            Ir al Inicio
          </Button>
        ]}
      />
    </div>
  );
};

export default NotFound;
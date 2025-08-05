import React from "react";
import { Skeleton, Spin } from "antd";
import styles from "./Loading.module.css";

const Loading: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <Spin size="large" tip="Cargando..." spinning={true}>
        <div className={styles.container}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </Spin>
    </div>
  );
};

export default Loading;
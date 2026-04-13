export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

export interface UserInfo {
  nombre: string;
  apellido: string;
  perfil: {
    nombre: string;
    nivel: number;
  };
}
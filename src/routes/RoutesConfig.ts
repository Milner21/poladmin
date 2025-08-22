const basePaths = {
    admin: "/admin", 
  };
  
  export const RoutesConfig = {
    // Rutas principales
    home: "/",
    login: "/login",
    
  
    // Rutas administrativas usando el prefijo dinámico
    registro_votantes: `${basePaths.admin}/registro-votantes`,
    dashboard: `${basePaths.admin}/dashboard`,
    eventos: `${basePaths.admin}/eventos`,
  };
  
  export default RoutesConfig;
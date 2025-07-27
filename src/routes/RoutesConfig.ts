const basePaths = {
    admin: "/admin", 
  };
  
  const RoutesConfig = {
    // Rutas principales
    home: "/",
    
  
    // Rutas administrativas usando el prefijo dinámico
    registro_votantes: `${basePaths.admin}/registro-votantes`,
  };
  
  export default RoutesConfig;
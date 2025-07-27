const basePaths = {
    admin: "/", 
  };
  
  const RoutesConfig = {
    // Rutas principales
    home: "/",
    
  
    // Rutas administrativas usando el prefijo dinámico
    registro_votantes: `${basePaths.admin}/resgitro-personas`,
  };
  
  export default RoutesConfig;
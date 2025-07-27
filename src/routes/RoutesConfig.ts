const basePaths = {
    admin: "/cloud/sp/gestion", 
  };
  
  const RoutesConfig = {
    // Rutas principales
    home: "/",
    
  
    // Rutas administrativas usando el prefijo dinámico
    //gistro_votantes: `${basePaths.admin}/resgitro-personas`,
    registro_votantes: "/"
  };
  
  export default RoutesConfig;
import { Routes, Route } from 'react-router';
import RoutesConfig from './RoutesConfig';
import { VoterRegistration } from '../pages/admin';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={RoutesConfig.registro_votantes} element={<VoterRegistration />} />
            

      {/* Rutas administrativas privadas */}
      
    </Routes>
  );
};

export default AppRoutes;

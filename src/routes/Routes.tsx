import { Routes, Route } from 'react-router';
import RoutesConfig from './RoutesConfig';
import { VoterRegistration } from '../pages/admin';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path={RoutesConfig.home} element={<VoterRegistration />} />
            

      {/* Rutas administrativas privadas */}
      
    </Routes>
  );
};

export default AppRoutes;

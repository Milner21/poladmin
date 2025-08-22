import React from 'react';
import styled, { keyframes } from 'styled-components';
import { usePWAInstall } from '@hooks/usePWAInstall';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const BannerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: ${slideUp} 0.3s ease-out;
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

const BannerText = styled.div`
  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 13px;
    }
  }
`;

const ShareIcon = styled.span`
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  margin: 0 2px;
`;

const BannerActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const InstallButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const PWAInstallBanner: React.FC = () => {
  const { showInstallPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();

  if (!showInstallPrompt) return null;

  return (
    <BannerContainer>
      <BannerContent>
        <BannerText>
          <h3>¡Instala nuestra app!</h3>
          {isIOS ? (
            <p>
              Para instalar: toca <ShareIcon>⎋</ShareIcon> y luego 
              "Agregar a pantalla de inicio"
            </p>
          ) : (
            <p>Instala la app para una mejor experiencia</p>
          )}
        </BannerText>
        
        <BannerActions>
          {!isIOS && (
            <InstallButton onClick={installApp}>
              Instalar
            </InstallButton>
          )}
          <DismissButton onClick={dismissPrompt}>
            ✕
          </DismissButton>
        </BannerActions>
      </BannerContent>
    </BannerContainer>
  );
};

export default PWAInstallBanner;
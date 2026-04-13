// components/ErrorBoundary.tsx

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Componente a mostrar en caso de error
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    // Actualiza el estado para mostrar la interfaz de fallback en el siguiente render
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Opcional: puedes registrar el error o enviarlo a un servicio de logging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de fallback aquí
      return this.props.fallback || <div>Ha ocurrido un error.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
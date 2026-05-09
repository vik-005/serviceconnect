'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-[2.5rem] border border-red-100 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Oups, un problème est survenu</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Une erreur s'est produite lors du chargement de cette section. Ne vous inquiétez pas, vos données sont en sécurité.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <RefreshCcw size={18} />
            <span>Réessayer</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

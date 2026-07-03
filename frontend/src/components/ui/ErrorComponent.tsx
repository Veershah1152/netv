import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiRefreshCw, FiWifi } from 'react-icons/fi';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  onRetry,
  isNetworkError = false,
}) => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 px-8 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="w-16 h-16 rounded-full bg-nv-surface flex items-center justify-center mb-6">
      {isNetworkError ? (
        <FiWifi className="w-8 h-8 text-brand-red" />
      ) : (
        <FiAlertCircle className="w-8 h-8 text-brand-red" />
      )}
    </div>
    <h2 className="text-h3 font-semibold text-white mb-2">{title}</h2>
    <p className="text-text-secondary text-body max-w-md mb-8">{message}</p>
    {onRetry && (
      <motion.button
        className="btn-info"
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiRefreshCw className="w-4 h-4" />
        Try Again
      </motion.button>
    )}
  </motion.div>
);

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorComponent
          title="Unexpected Error"
          message={this.state.error?.message || 'An unexpected error occurred.'}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

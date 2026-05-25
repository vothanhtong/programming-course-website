import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// BUG-24 FIX: ErrorBoundary ngăn toàn trang trắng khi runtime error xảy ra
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log lỗi ra console (dev) — production nên gửi đến Sentry/Datadog
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#020817',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ color: '#e2e8f0', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Đã xảy ra lỗi
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Trang gặp lỗi không mong muốn. Vui lòng thử tải lại hoặc quay về trang chủ.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '1.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Thử lại
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(59,130,246,0.85)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

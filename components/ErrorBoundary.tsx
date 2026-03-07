'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Our frame builder hit a snag. This usually fixes itself with a quick refresh.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1B5A4A] text-white rounded-full text-sm font-medium hover:bg-[#164a3d] transition-colors"
            >
              Refresh Page
            </button>
            <p className="mt-4 text-xs text-gray-400">
              If this keeps happening,{' '}
              <a href="https://www.smallwoodhome.com/pages/contact" className="underline hover:text-gray-600">
                contact us
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

'use client';

import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

interface ToastViewerProps {
  initialValue: string;
}

export default function ToastViewer({ initialValue }: ToastViewerProps) {
  return (
    <Viewer initialValue={initialValue} />
  );
}
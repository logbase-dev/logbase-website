import React from 'react';
import dynamic from 'next/dynamic';
import type { Editor as ToastUIEditor, EditorProps } from '@toast-ui/react-editor';

// Editor 컴포넌트를 동적으로, 그리고 서버사이드 렌더링(SSR) 없이 불러옵니다.
const Editor = dynamic(
  () => import('@toast-ui/react-editor').then(mod => mod.Editor), 
  { ssr: false, loading: () => <p>에디터 로딩 중...</p> }
);

const EditorWithRef = React.forwardRef<ToastUIEditor, EditorProps>((props, ref) => {
  return (
    <Editor
      {...props}
      ref={ref}
    />
  );
});
EditorWithRef.displayName = 'EditorWithRef';

export default EditorWithRef;

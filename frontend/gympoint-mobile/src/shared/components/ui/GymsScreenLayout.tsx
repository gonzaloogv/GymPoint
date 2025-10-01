import React from 'react';
import { Screen } from './Screen';

const MAP_CONTENT_SPACING = { paddingBottom: 24 } as const;

type Props = {
  children: React.ReactNode;
  isListView: boolean;
  contentPadding?: any;
};

export function GymsScreenLayout({ 
  children, 
  isListView, 
  contentPadding 
}: Props) {
  const computedContentPadding = contentPadding || (!isListView ? MAP_CONTENT_SPACING : undefined);

  return (
    <Screen 
      scroll={!isListView} 
      contentContainerStyle={computedContentPadding}
    >
      {children}
    </Screen>
  );
}

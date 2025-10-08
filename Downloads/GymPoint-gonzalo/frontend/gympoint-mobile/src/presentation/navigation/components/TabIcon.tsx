import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { SvgUri, SvgXml } from 'react-native-svg';

type IconSource =
  | ImageSourcePropType // PNG/JPG estáticos: require('...png') o import x from '...png'
  | React.ComponentType<any> // SVG como componente: import Icon from '...svg'
  | { default: React.ComponentType<any> } // SVG empaquetado como { default: Componente }
  | string; // SVG string o URL

export function TabIcon({
  source,
  size = 20,
  color,
}: {
  source: IconSource;
  size?: number;
  color?: string;
}) {
  // 1) Caso: llega { default: Componente } (algunos bundlers)
  // 2) Caso: llega Componente directamente
  const MaybeComp: any = (source as any)?.default ?? source;

  if (typeof MaybeComp === 'function') {
    // SVG importado como componente (con react-native-svg-transformer)
    return (
      <MaybeComp width={size} height={size} color={color} fill={color} stroke={color} />
    );
  }

  if (typeof MaybeComp === 'string') {
    // Puede ser: a) XML de SVG  b) URL (web)  c) asset path
    const looksLikeXml = MaybeComp.trim().startsWith('<svg');
    if (looksLikeXml) {
      return <SvgXml xml={MaybeComp} width={size} height={size} color={color} />;
    }
    // Si es URL de un .svg
    if (MaybeComp.endsWith('.svg') || MaybeComp.startsWith('http')) {
      return <SvgUri uri={MaybeComp} width={size} height={size} color={color} />;
    }
    // Si fuera otra string, caemos a Image
    return (
      <Image
        source={{ uri: MaybeComp }}
        style={{ width: size, height: size, tintColor: color, resizeMode: 'contain' }}
      />
    );
  }

  // PNG/JPG (require/import) → Image
  return (
    <Image
      source={MaybeComp as ImageSourcePropType}
      style={{ width: size, height: size, tintColor: color, resizeMode: 'contain' }}
    />
  );
}

declare module 'react-native-svg' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
  }

  export const Svg: React.ComponentType<SvgProps>;
  export const Path: React.ComponentType<any>;
  export const Defs: React.ComponentType<any>;
  export const LinearGradient: React.ComponentType<any>;
  export const Stop: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const Rect: React.ComponentType<any>;
  export const Line: React.ComponentType<any>;
  export default Svg;
}

declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: any;
  export const vi: any;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
}

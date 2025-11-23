import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export const EmptyBannerIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 192" fill="none">
    <Rect width="400" height="192" fill="#FAFAFA" />
    <Path
      d="M120 96L140 76L160 96L180 66L200 86L220 66L240 86L260 66L280 96"
      stroke="#E5E5E5"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx="140" cy="60" r="8" fill="#E5E5E5" />
    <Path
      d="M180 120H220M180 130H240M180 140H210"
      stroke="#E5E5E5"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const EmptyAvatarIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 112 112" fill="none">
    <Circle cx="56" cy="56" r="56" fill="#FAFAFA" />
    <Circle cx="56" cy="45" r="18" fill="#E5E5E5" />
    <Path
      d="M25 85C25 70 38 58 56 58C74 58 87 70 87 85"
      stroke="#E5E5E5"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);

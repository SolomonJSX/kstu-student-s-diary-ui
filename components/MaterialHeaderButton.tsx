// components/MaterialHeaderButton.tsx
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons'; // или другой иконочный пакет
import { HeaderButton } from 'react-navigation-header-buttons';

export const MaterialHeaderButton = (props: any) => (
  <HeaderButton
    {...props}
    IconComponent={MaterialIcons}
    iconSize={23}
    color="white" // или другой цвет, подходящий под вашу тему
  />
);
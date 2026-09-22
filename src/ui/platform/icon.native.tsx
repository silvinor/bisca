// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons/faFloppyDisk';
import { faCopyright } from '@fortawesome/free-solid-svg-icons/faCopyright';

const icons = {
  copyright: faCopyright,
  ellipsis_vertical: ?,
} as const;

type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  copyText?: string;
};

export function Icon({
  name,
  size = 16,
  color,
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icons[name]}
      size={size}
      color={color}
    />
  );
}

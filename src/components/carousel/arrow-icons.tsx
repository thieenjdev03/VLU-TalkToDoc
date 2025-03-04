import Iconify, { IconifyProps } from '../iconify';
import Other from '../../sections/_examples/extra/animate-view/other/index';

// ----------------------------------------------------------------------

type Props = {
  icon?: IconifyProps; // Right icon
  isRTL?: boolean;
};

export function LeftIcon({ icon = 'eva:arrow-ios-forward-fill', isRTL }: Props) {
  return (
    <Iconify
      icon={icon}
      sx={{
        transform: ' scaleX(-1)',
        ...(isRTL && {
          transform: ' scaleX(1)',
        }),
      }}
    />
  );
}

export function RightIcon({ icon = 'eva:arrow-ios-forward-fill', isRTL }: Props) {
  return (
    <Iconify
      icon={icon}
      sx={{
        ...(isRTL && {
          transform: ' scaleX(-1)',
        }),
      }}
    />
  );
}

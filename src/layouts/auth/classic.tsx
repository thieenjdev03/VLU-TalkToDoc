import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------
type Props = {
  title?: string;
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children, image, title }: Props) {
  // const { method } = useAuthContext();

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: '100%',
        px: { xs: 2, md: 8 },
        backgroundImage: `url('https://stag-top-proj.web.app/static/media/top-bg-overlay.6fde37db.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
      }}
    >
      {renderContent}
    </Stack>
  );
}

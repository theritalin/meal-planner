import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import { isWebAdsActive, setConsent } from '../../services/ads';
import { useAdsConsent } from './hooks';
import { useI18n } from '../../i18n';

/**
 * Basit çerez / reklam onayı bandı (yalnızca web, yalnızca reklamlar etkinken).
 * Native'de Google UMP formu kullanıldığı için hiçbir şey çizmez.
 * Seçim localStorage'da saklanır; "Kabul et" → kişiselleştirilmiş reklam,
 * "Reddet" → kişiselleştirilmemiş reklam.
 *
 * Uygulama kabuğunda bir kez, Router içinde render edin.
 *
 * @param {{ bottomOffset?: object|number }} props mobil alt navigasyonun üstünde
 *        kalması için alt boşluk (varsayılan: mobilde 88px, masaüstünde 16px).
 */
const ConsentBanner = ({ bottomOffset = { xs: 88, md: 16 } }) => {
  const consent = useAdsConsent();
  const { t } = useI18n();

  if (!isWebAdsActive() || consent !== null) return null;

  return (
    <Paper
      role="dialog"
      aria-live="polite"
      aria-label={t('ads.consent.ariaLabel')}
      elevation={6}
      sx={{
        position: 'fixed',
        left: { xs: 12, sm: 'auto' },
        right: { xs: 12, sm: 16 },
        bottom: bottomOffset,
        maxWidth: { sm: 420 },
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <CookieOutlinedIcon color="primary" sx={{ mt: 0.25 }} aria-hidden="true" />
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {t('ads.consent.text')}{' '}
            <Link component={RouterLink} to="/privacy">
              {t('ads.consent.privacy')}
            </Link>
            .
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" color="inherit" onClick={() => setConsent('denied')}>
              {t('ads.consent.deny')}
            </Button>
            <Button size="small" variant="contained" onClick={() => setConsent('granted')}>
              {t('ads.consent.accept')}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ConsentBanner;

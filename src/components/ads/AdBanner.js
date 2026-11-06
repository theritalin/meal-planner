import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  getAdsConfig,
  getAdSenseSlot,
  isWebAdsActive,
  loadAdSense,
  pushAdSenseUnit,
} from '../../services/ads';
import { isNativeApp } from '../../services/platform';
import { useAdsConsent } from './hooks';
import { useI18n } from '../../i18n';

export { useNativeBanner, useAdsConsent } from './hooks';

const MIN_HEIGHT = { xs: 100, sm: 120 };

const Label = () => {
  const { t } = useI18n();
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{
        display: 'block',
        textAlign: 'center',
        color: 'text.secondary',
        fontSize: '0.65rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        mb: 0.5,
        userSelect: 'none',
      }}
    >
      {t('ads.label')}
    </Typography>
  );
};

const DebugPlaceholder = ({ placement, sx }) => {
  const { t } = useI18n();
  return (
    <Box
      role="presentation"
      sx={{
        my: 2,
        minHeight: MIN_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        color: 'text.secondary',
        fontSize: '0.8rem',
        ...sx,
      }}
    >
      {t('ads.debugPlaceholder', { placement: placement || 'default' })}
    </Box>
  );
};

/**
 * Sayfa içi reklam alanı.
 *  - Web: duyarlı AdSense birimi (<ins class="adsbygoogle">), düzen kaymasını
 *    önlemek için minimum yükseklik ayrılır.
 *  - Native: hiçbir şey çizmez (banner, kabukta useNativeBanner ile gösterilir).
 *  - Reklamlar kapalıysa: hiçbir şey; REACT_APP_ADS_DEBUG=true ise kesikli çerçeve.
 *
 * @param {{ placement?: string, sx?: object }} props
 *        placement: 'planner' | 'recipes' | 'recipeDetail' | 'export' | ...
 */
const AdBanner = ({ placement = 'default', sx }) => {
  const { t } = useI18n();
  const config = getAdsConfig();
  const consent = useAdsConsent();
  const native = isNativeApp();
  const active = isWebAdsActive();
  const slot = getAdSenseSlot(placement);
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  // Onay seçimi yapıldıktan sonra betiği yükle ve birimi doldur.
  useEffect(() => {
    if (!active || !slot || consent === null || pushedRef.current) return undefined;
    let cancelled = false;
    loadAdSense().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        setFailed(true);
        return;
      }
      if (insRef.current && !pushedRef.current) {
        pushedRef.current = true;
        if (!pushAdSenseUnit()) setFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [active, slot, consent]);

  if (native) return null;

  if (!active || !slot) {
    return config.debug ? <DebugPlaceholder placement={placement} sx={sx} /> : null;
  }

  // Reklam engelleyici vb. → alanı boş bırakma, tamamen kaldır.
  if (failed) return null;

  return (
    <Box
      component="aside"
      aria-label={t('ads.label')}
      sx={{ my: 2, width: '100%', overflow: 'hidden', textAlign: 'center', ...sx }}
    >
      <Label />
      <Box sx={{ minHeight: MIN_HEIGHT }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={config.adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
          {...(config.adsenseTestMode ? { 'data-adtest': 'on' } : {})}
        />
      </Box>
    </Box>
  );
};

export default AdBanner;

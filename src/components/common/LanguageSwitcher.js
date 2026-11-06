import React from "react";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import { LANGUAGES, useI18n } from "../../i18n";

/**
 * Dil seçici (TR | EN). Seçim cihazda saklanır; varsayılan Türkçe.
 * @param {{ size?: "small"|"medium", showIcon?: boolean, sx?: object }} props
 */
const LanguageSwitcher = ({ size = "small", showIcon = false, sx }) => {
  const { lang, setLang, t } = useI18n();
  return (
    <Tooltip title={t("common.language")}>
      <ToggleButtonGroup
        exclusive
        size={size}
        value={lang}
        onChange={(_, next) => next && setLang(next)}
        aria-label={t("common.language")}
        sx={{
          bgcolor: "background.paper",
          "& .MuiToggleButton-root": {
            px: 1.5,
            py: size === "small" ? 0.25 : 0.75,
            fontWeight: 700,
            border: 1,
            borderColor: "divider",
          },
          "& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
          },
          ...sx,
        }}
      >
        {showIcon && (
          <ToggleButton value="__icon" disabled sx={{ px: 1 }} aria-hidden>
            <TranslateRoundedIcon fontSize="small" />
          </ToggleButton>
        )}
        {LANGUAGES.map((l) => (
          <ToggleButton
            key={l.code}
            value={l.code}
            aria-label={l.label}
            lang={l.code}
          >
            {l.short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Tooltip>
  );
};

export default LanguageSwitcher;

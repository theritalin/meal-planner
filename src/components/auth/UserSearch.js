import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { searchUsers } from "../../services/firebase";
import { useMeals } from "../../context/MealContext";
import { getInitials } from "./profile/utils";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

/**
 * Kompakt kullanıcı arama kutusu. Seçilen kullanıcının profiline
 * (/profile/:uid) gider.
 *
 * Props:
 * - onNavigate?: () => void — yönlendirmeden sonra çağrılır (ör. drawer kapatma)
 * - size?: "small" | "medium" (varsayılan "small")
 * - sx?: kök Autocomplete stili
 */
const UserSearch = ({ onNavigate, size = "small", sx }) => {
  const navigate = useNavigate();
  const { user } = useMeals();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = input.trim();
    if (term.length < MIN_CHARS) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchUsers(term);
      if (!active) return;
      setOptions(results || []);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [input]);

  const handleChange = (_event, selected) => {
    if (!selected?.uid) return;
    navigate(`/profile/${selected.uid}`);
    setInput("");
    setOptions([]);
    onNavigate?.();
  };

  const tooShort = input.trim().length < MIN_CHARS;

  return (
    <Autocomplete
      size={size}
      sx={{ minWidth: 200, ...sx }}
      options={options}
      value={null}
      inputValue={input}
      onInputChange={(_e, value, reason) => {
        if (reason !== "reset") setInput(value);
      }}
      onChange={handleChange}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.uid === b.uid}
      getOptionLabel={(o) => o.displayName || o.email || ""}
      loading={loading}
      loadingText="Aranıyor…"
      noOptionsText={
        tooShort ? `En az ${MIN_CHARS} harf yazın` : "Kullanıcı bulunamadı"
      }
      clearOnBlur={false}
      blurOnSelect
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Kullanıcı ara…"
          inputProps={{ ...params.inputProps, "aria-label": "Kullanıcı ara" }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            component="li"
            key={option.uid}
            {...optionProps}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Avatar
              src={option.photoURL || undefined}
              alt=""
              sx={{
                width: 32,
                height: 32,
                fontSize: 14,
                bgcolor: "primary.main",
              }}
            >
              {getInitials(option.displayName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.displayName || "İsimsiz Kullanıcı"}
                {user?.uid === option.uid && " (siz)"}
              </Typography>
            </Box>
          </Box>
        );
      }}
    />
  );
};

export default UserSearch;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchUsers } from "../../services/firebase";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTerm.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setUsers(results);
      } catch (error) {
        console.error("Kullanıcı arama hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUserSelect = (event, user) => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    }
  };

  // Kullanıcı adından baş harflerini al
  const getInitials = (name) => {
    if (!name) return "K";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Autocomplete
      options={users}
      getOptionLabel={(option) => option.displayName || option.email || ""}
      onChange={handleUserSelect}
      loading={loading}
      noOptionsText="Kullanıcı bulunamadı"
      loadingText="Kullanıcılar aranıyor..."
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Kullanıcı ara..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.uid}>
          <Box
            sx={{ display: "flex", alignItems: "center", width: "100%", py: 1 }}
          >
            <Avatar
              src={option.photoURL}
              alt={option.displayName || "Kullanıcı"}
              sx={{ mr: 2, bgcolor: "primary.main" }}
            >
              {!option.photoURL && getInitials(option.displayName)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {option.displayName || "İsimsiz Kullanıcı"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {option.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default UserSearch;

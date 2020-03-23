import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import * as Keys from "../keys";
import strings from "../strings"
import request from "superagent"

function loadScript(src, position, id) {
  if (!position) return;

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  input: {
    padding: 10,
    paddingLeft: 50,
    transition: theme.transitions.create("width"),
    width: "100%"
  },
}));

export default function GoogleMaps(props) {
  const classes = useStyles();
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const loaded = React.useRef(false);

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        "https://maps.googleapis.com/maps/api/js?key=" + Keys.GOOGLE_API_KEY + "&libraries=places",
        document.querySelector("head"),
        "google-maps",
      );
    }

    loaded.current = true;
  }

  const handleChange = event => {
    setInputValue(event.target.value);
  };

  const handleClick = id => {
    /*request.get("https://maps.googleapis.com/maps/api/place/details/json")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({key: Keys.GOOGLE_GEOCODE_KEY, place_id: id, fields: "geometry"})
      .end(function(err, res) {
        alert(err)
        var result = res.text.trim();
        var obj = JSON.parse(result);
        props.onChanged(obj.geometry.lat, obj.geometry.lng)
      });*/

      var request = {
        placeId: id,
        fields: ["geometry"]
      };

      autocompleteService.current.getDetails(request, callback);

      function callback(place, status) {
        alert(place)
      }
  }

  const fetch = React.useMemo(
    () =>
      throttle((input, callback) => {
        autocompleteService.current.getPlacePredictions(input, callback);
      }, 200),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions([]);
      return undefined;
    }

    fetch({ input: inputValue }, results => {
      if (active) {
        setOptions(results || []);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      style={{ width: 500 }}
      getOptionLabel={option => (typeof option === "string" ? option : option.description)}
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      freeSolo
      disableOpenOnFocus
      renderInput={params => (
        <TextField
          {...params}
          placeholder={strings.searchLocation}
          style={{ padding: 10, marginLeft: 40, width: 440 }}
          onChange={handleChange}
        />
      )}
      renderOption={option => {
        const matches = option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map(match => [match.offset, match.offset + match.length]),
        );

        return (
          <Grid container alignItems="center" onClick={() => handleClick(option.place_id)}>
            <Grid item>
              <LocationOnIcon className={classes.icon} />
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                  {part.text}
                </span>
              ))}

              <Typography variant="body2" color="textSecondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
}

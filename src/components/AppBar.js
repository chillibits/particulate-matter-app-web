import React, {Component} from "react";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { withStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import Avatar from "@material-ui/core/Avatar";
import LocationSearch from "./LocationSearch";
import strings from "../strings";

const styles = (theme) => ({
  root: {
    width: "100%",
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: 10,
      width: "auto",
    },
  },
  searchIcon: {
    width: 50,
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

class SearchAppBar extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton href="#" className={classes.menuButton} color="inherit" aria-label={strings.appName}>
              <Avatar alt={strings.appName} src="../favicon.ico" className={classes.avatar} />
            </IconButton>
            <Typography className={classes.title} variant="h6" color="inherit" noWrap>{strings.appName}</Typography>
            {/* <div className={classes.grow} />
            <div className={classes.search}>
              <div className={classes.searchIcon}><SearchIcon /></div>
              <LocationSearch onChange={this.props.onChange}/>
            </div> */}
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

SearchAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  suggestions: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

export default withStyles(styles)(SearchAppBar);

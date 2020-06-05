import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Icon from "@material-ui/core/Icon";
import RestoreIcon from "@material-ui/icons/Restore";
import FavoriteIcon from "@material-ui/icons/Favorite";
import LocationOnIcon from "@material-ui/icons/LocationOn";

const styles = {
  root: {
    width: 500,
  },
};

class LabelBottomNavigation extends React.Component {
  state = {
    value: "recents",
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <BottomNavigation value={value} onChange={this.handleChange} className={classes.root}>
        <BottomNavigationAction label="Favoriten" value="favorites" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Meine Sensoren" value="mySensors" icon={<FavoriteIcon />} />
      </BottomNavigation>
    );
  }
}

LabelBottomNavigation.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LabelBottomNavigation);

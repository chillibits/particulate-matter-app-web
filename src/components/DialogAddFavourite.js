import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import { CirclePicker } from "react-color";
import fire from "../fire";
import strings from "../strings";

const styles = (theme) => ({
  dialogContent: {
    marginTop: "-25px",
    marginLeft: "20px",
    marginRight: "20px",
  },
});

class DialogAddFavourite extends React.Component {
  state = {
    name: "",
    buttonDisabled: true,
  };

  onAddFavourite = () => {
    //Favourit hinzufügen
    var timestamp = Math.floor(Date.now());
    var dataNew = this.props.userData;
    dataNew.push({ chip_id: this.props.chipId, color: this.state.color, fav: true, name: this.state.name });
    var obj = { time: timestamp, device: "web", data: dataNew };
    fire.database().ref("sync/" + this.props.syncKey).set(obj);
    //Dialog schließen
    this.props.onClose();
  };

  onNameChanged = (event) => {
    var buttonDisabled = event.target.value.length === 0 || this.state.color === null;
    this.setState({ name: event.target.value, buttonDisabled: buttonDisabled });
  }

  onColorChanged = (color, event) => {
    this.setState({ color: color.hex, buttonDisabled: this.state.name.length === 0 });
  }

  render() {
    const { classes } = this.props;

    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="dialog-title" >
        <DialogTitle id="dialog-title">{strings.addSensorTofavorites}</DialogTitle>
        <div className={classes.dialogContent}>
          <p><TextField label={strings.displayName} style={{width: "320px"}} onChange={this.onNameChanged} variant="outlined"/></p>
          <p><TextField label={strings.chipId} disabled value={this.props.chipId} style={{width: "320px"}} variant="outlined"/></p>
          <CirclePicker color={this.state.color} width="340px" onChangeComplete={this.onColorChanged} />
        </div>
        <DialogActions>
            <Button onClick={this.props.onClose} color="primary">{strings.cancel}</Button>
            <Button onClick={this.onAddFavourite} color="primary" disabled={this.state.buttonDisabled} autoFocus>{strings.addFavourite}</Button>
          </DialogActions>
      </Dialog>
    );
  }
}

DialogAddFavourite.propTypes = {
  syncKey: PropTypes.string.isRequired,
  userData: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  chipId: PropTypes.string.isRequired,
};

export default withStyles(styles)(DialogAddFavourite);

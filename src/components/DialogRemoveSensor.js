import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContentText from "@material-ui/core/DialogContentText";
import fire from "../fire";
import strings from "../strings";

class DialogRemoveSensor extends React.Component {
  onRemove = () => {
    var timestamp = Math.floor(Date.now());
    var dataNew = [];
    this.props.userData.map((sensor) => {
      if(sensor.chipId !== this.props.chipId) dataNew.push(sensor);
      return true;
    });
    var obj = { time: timestamp, device: "web", data: dataNew };
    fire.database().ref("sync/" + this.props.syncKey).set(obj);

    this.props.onClose(1);
  }

  render() {
    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">{strings.removeSensor}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{strings.removeSensorMessage1} <b>{this.props.chipId}</b> {strings.removeSensorMessage2}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary" autoFocus>{strings.cancel}</Button>
          <Button onClick={this.onRemove} color="primary">{strings.remove}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogRemoveSensor.propTypes = {
  syncKey: PropTypes.string.isRequired,
  userData: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chipId: PropTypes.string.isRequired,
};

export default DialogRemoveSensor;

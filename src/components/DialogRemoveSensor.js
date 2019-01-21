import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import fire from '../fire'

class DialogRemoveSensor extends React.Component {
  onRemove = () => {
    var timestamp = Math.floor(Date.now());
    var data_new = [];
    this.props.user_data.map(sensor => {
      if(sensor.chip_id !== this.props.chip_id) data_new.push(sensor);
      return true;
    });
    var obj = { time: timestamp, device: "web", data: data_new }
    fire.database().ref('sync/' + this.props.sync_key).set(obj)

    this.props.onClose(1);
  }

  render() {
    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">{"Sensor entfernen"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Wollen Sie den Sensor mit der Chip-ID <b>{this.props.chip_id}</b> wirklich entfernen? Sie können ihn jederzeit wieder verknüpfen.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary" autoFocus>Abbrechen</Button>
          <Button onClick={this.onRemove} color="primary">Entfernen</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogRemoveSensor.propTypes = {
  sync_key: PropTypes.string.isRequired,
  user_data: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chip_id: PropTypes.string.isRequired,
};

export default DialogRemoveSensor;

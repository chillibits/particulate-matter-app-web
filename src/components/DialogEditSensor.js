import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { CirclePicker } from 'react-color'
import fire from '../fire'
import strings from '../strings'

const styles = theme => ({
  dialog_content: {
    marginTop: "-25px",
    marginLeft: "20px",
    marginRight: "20px",
  },
});

class DialogEditSensor extends React.Component {
  state = {
    name: this.props.name,
    color: this.props.color,
    error: false,
  };

  nameChanged = (event) => {
    var error = event.target.value.length === 0;
    this.setState({ name: event.target.value, error: error });
  }

  colorChanged = (color, event) => {
    this.setState({ color: color.hex });
  }

  saveChangings = () => {
    var timestamp = Math.floor(Date.now());
    var data_new = [];
    this.props.data.map(sensor => {
      if(sensor.chip_id === this.props.chip_id) {
        data_new.push({ chip_id: this.props.chip_id, color: this.state.color, fav: this.props.fav, name: this.state.name });
      } else {
        data_new.push(sensor);
      }
      return true;
    });
    var obj = { time: timestamp, device: "web", data: data_new }
    fire.database().ref('sync/' + this.props.sync_key).set(obj)

    this.props.onClose(1);
  }

  render() {
    const { classes } = this.props;

    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">{strings.edit_sensor}</DialogTitle>
        <div className={classes.dialog_content}>
          <p><TextField label={strings.display_name} value={this.state.name} style={{width: "320px"}} onChange={this.nameChanged} variant="outlined"/></p>
          <p><TextField label={strings.chip_id} value={this.props.chip_id} style={{width: "320px"}} variant="outlined" disabled/></p>
          <CirclePicker colors={[this.props.color, "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"]} color={this.state.color} width="340px" onChangeComplete={this.colorChanged} />
        </div>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">{strings.cancel}</Button>
          <Button onClick={this.saveChangings} color="primary" disabled={this.state.error} autoFocus>{strings.save}</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DialogEditSensor.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chip_id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  fav: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  sync_key: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default withStyles(styles)(DialogEditSensor);

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
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

class DialogAddFavourite extends React.Component {
  state = {
    name: "",
    color: undefined,
    button_disabled: true,
  };

  onAddFavourite = () => {
    //Favourit hinzufügen
    var timestamp = Math.floor(Date.now());
    var data_new = this.props.user_data;
    data_new.push({ chip_id: this.props.chip_id, color: this.state.color, fav: true, name: this.state.name });
    var obj = { time: timestamp, device: "web", data: data_new }
    fire.database().ref('sync/' + this.props.sync_key).set(obj)
    //Dialog schließen
    this.props.onClose();
  };

  onNameChanged = (event) => {
    var button_disabled = event.target.value.length === 0 || this.state.color === undefined;
    this.setState({ name: event.target.value, button_disabled: button_disabled });
  }

  onColorChanged = (color, event) => {
    this.setState({ color: color.hex, button_disabled: this.state.name.length === 0 });
  }

  render() {
    const { classes } = this.props;

    return (
      <Dialog open={this.props.opened} onClose={this.props.onClose} aria-labelledby="dialog-title" >
        <DialogTitle id="dialog-title">{strings.add_sensor_to_favourites}</DialogTitle>
        <div className={classes.dialog_content}>
          <p><TextField label={strings.display_name} style={{width: "320px"}} onChange={this.onNameChanged} variant="outlined"/></p>
          <p><TextField label={strings.chip_id} disabled value={this.props.chip_id} style={{width: "320px"}} variant="outlined"/></p>
          <CirclePicker color={this.state.color} width="340px" onChangeComplete={this.onColorChanged} />
        </div>
        <DialogActions>
            <Button onClick={this.props.onClose} color="primary">{strings.cancel}</Button>
            <Button onClick={this.onAddFavourite} color="primary" disabled={this.state.button_disabled} autoFocus>{strings.add_favourite}</Button>
          </DialogActions>
      </Dialog>
    );
  }
}

DialogAddFavourite.propTypes = {
  sync_key: PropTypes.string.isRequired,
  user_data: PropTypes.array.isRequired,
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  chip_id: PropTypes.string.isRequired,
};

export default withStyles(styles)(DialogAddFavourite);

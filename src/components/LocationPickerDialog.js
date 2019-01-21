import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import LocationPicker from 'react-location-picker';

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class LocationPickerDialog extends React.Component {
  state = {
    adress: "",
    position: {
       lat: 0,
       lng: 0
    }
  };

  componentDidMount () {
    /*navigator && navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      this.setState({
        position: { lat: latitude, lng: longitude }
      });
    });*/
  }

  handleLocationChange ({ position, address }) {
    this.setState({ position, address });
  }

  onClose = () => {
    this.props.onChoose(this.state.position, this.state.address);
  }

  render() {
    const { classes } = this.props;
    return (
      <Dialog fullScreen open={true} onClose={this.onClose} TransitionComponent={Transition} >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" className={classes.flex}> Wählen Sie den genauen Standort des Sensors auf der Karte </Typography>
            <IconButton color="inherit" onClick={this.onClose} aria-label="Fertig"><DoneIcon/></IconButton>
          </Toolbar>
        </AppBar>
        <LocationPicker containerElement={ <div style={{height: '100%', overflowY: "hidden"}} /> } mapElement={ <div style={{height: '100%'}} /> } radius={-1} defaultPosition={this.state.position} onChange={this.handleLocationChange} />
      </Dialog>
    );
  }
}

LocationPickerDialog.propTypes = {
  onChoose: PropTypes.func.isRequired,
};

export default withStyles(styles)(LocationPickerDialog);

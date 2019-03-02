import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button, Fab, Paper } from '@material-ui/core';
import { AppBar, MapContainer, LoginContainer, DialogAddSensor, DialogAddFavourite, DialogSensorData, DialogEditSensor, DialogRemoveSensor, DialogSensorDetails } from './components'
import AddIcon from '@material-ui/icons/Add';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import request from 'superagent'
import md5 from 'md5'
import fire from './fire'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import strings from './strings'

const styles = theme => ({
  main: {
    flexGrow: 1,
    display: 'flex',
    position: 'absolute',
    width: "100%",
    height: "calc(100% - 64px - 45px)",
    zIndex: 1,
    top: 64,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    backgroundColor: "#32a087",
    height: 45,
    paddingLeft: 13,
    paddingRight: 13,
    paddingTop: 5,
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
  },
  button_download: {
    position: 'absolute',
    right: 13,
  },
  button_info: {
    position: 'absolute',
    right: 265,
  },
  button_homepage: {
    position: 'absolute',
    right: 338,
  }
});

class App extends Component {
  state = {
    sync_key: "",
    user_data: [],
    favourites: [],
    own_sensors: [],
    first_sync_complete: false,
    logged_in: false,
    markerData: [],
    currentPosition: {
      lat: 52.520008,
      lng: 13.404954
    },
    selected: undefined,
    selected_id: undefined,
    suggestions: [],
    dialog_add_sensor_open: false,
    dialog_add_favourite_open: false,
    dialog_sensor_data_open: false,
    dialog_sensor_data_route_open: true,
    dialog_sensor_details_open: false,
    dialog_edit_sensor_open: false,
    dialog_remove_sensor_open: false,
    snackbar_message: strings.action_successful,
    snackbar_success_open: false,
    snackbar_error_open: false
  }

  constructor(props) {
    super(props)

    //Aktuelle Position ermitteln
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        currentPosition: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
    });

    //Zufälligen String für QR-Code generieren
    var randomString = require('random-string');
    var rand = randomString({length: 25});
    this.state.sync_key = rand;

    window.addEventListener("beforeunload", (ev) => {
        fire.database().ref('sync/' + this.state.sync_key).remove();
    });

    //Alle Sensoren laden
    this.loadAllSensors()
  }

  componentDidMount() {
    const currentComponent = this;
    var timestamp = Math.floor(Date.now());

    var obj = { time: timestamp, device: "web" }

    fire.database().ref('sync/' + this.state.sync_key).set(obj)
    fire.database().ref('sync/' + this.state.sync_key).on('value', function(snap) {
      if(snap.val() !== null) {
        if(snap.child("time").val() > timestamp) {
          //Daten auslesen
          var data = snap.child("data").val();
          var favourites = [];
          var own_sensors = [];

          if(data!== null) {
            data.map(sensor => {
              if(sensor.fav) {
                favourites.push(sensor);
              } else {
                own_sensors.push(sensor);
              }
              return true;
            });
          } else {
            data = [];
          }

          //Anwenden
          currentComponent.setState({ logged_in: true, user_data: data, favourites: favourites, own_sensors: own_sensors, snackbar_success_open: currentComponent.state.first_sync_complete === false, snackbar_message: "Verknüpfung mit Android-App erfolgreich", first_sync_complete: true });
        }
      } else {
        currentComponent.setState({ logged_in: false, user_data: [], favourites: [], own_sensors: [], snackbar_error_open: true, snackbar_message: "Verbindung zur Android-App beendet", first_sync_complete: false });
      }
    })
  }

  loadAllSensors = () => {
    let currentComponent = this;
    request.post('https://h2801469.stratoserver.net/ServerScriptWeb_v100.php')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({command: "getall"})
      .end(function(err, res) {
        var result = res.text.trim();
        var obj = JSON.parse(result);
        currentComponent.setState({ markerData: obj });
      });
  }

  handleSearchChange = name => (event, { newValue }) => {
    let currentComponent = this;
    if(newValue !== "") {
      var key_enc = md5("AIzaSyDUiKmZIwgnhCcWldQSuScuzKE8vGg94dc");
      request.post('https://h2801469.stratoserver.net/autocomplete.php')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({key: key_enc, q: newValue})
        .end(function(err, res) {
          try{
            var result = res.text.trim();
            var suggestions_string = JSON.parse(result);

            currentComponent.setState({
              suggestions: suggestions_string.predictions
            });
          } catch(e){
            console.log("Error: Loading place predictions");
          }
        });
    }
  };

  onShowAddSensorDialog = () => {
    this.setState({ dialog_add_sensor_open: true });
  }

  onHideAddSensorDialog = (state) => {
    this.setState({ dialog_add_sensor_open: false });
    this.onSnackbarOpen(state, strings.sensor_added_successfully, strings.error_please_try_again);
  }

  onShowAddFavouriteDialog = (selected_id) => {
    this.setState({ dialog_add_favourite_open: true, selected_id: selected_id });
  }

  onHideAddFavouriteDialog = (state) => {
    this.setState({ dialog_add_favourite_open: false });
    this.onSnackbarOpen(state, strings.sensor_favourized, strings.favourization_failed_try_again);
  }

  onShowSensorDataDialog = (sensor) => {
    this.setState({ dialog_sensor_data_open: true, selected: sensor });
  }

  onHideSensorDataDialog = () => {
    this.setState({ dialog_sensor_data_open: false, dialog_sensor_data_route_open: false});
  }

  onShowDetailsDialog = (sensor) => {
    this.setState({ dialog_sensor_details_open: true, selected: sensor });
  }

  onHideDetailsDialog = () => {
    this.setState({ dialog_sensor_details_open: false });
  }

  onShowEditSensorDialog = (sensor) => {
    this.setState({ dialog_edit_sensor_open: true, selected: sensor });
  }

  onHideEditSensorDialog = (state) => {
    this.setState({ dialog_edit_sensor_open: false, selected: undefined });
    this.onSnackbarOpen(state, strings.changings_saved, strings.changings_save_failed);
  }

  onShowRemoveSensorDialog = (selected_id) => {
    this.setState({ dialog_remove_sensor_open: true, selected_id: selected_id});
  }

  onHideRemoveSensorDialog = (state) => {
    this.setState({ dialog_remove_sensor_open: false, selected: undefined });
    this.onSnackbarOpen(state, strings.sensor_removed_successfully, strings.sensor_removal_failed);
  }

  onSnackbarOpen = (state, success_message, error_message) => {
    if(state === 1) {
      this.setState({ snackbar_success_open: true, snackbar_message: success_message });
    } else if(state === 2) {
      this.setState({ snackbar_error_open: true, snackbar_message: error_message });
    }
  }

  onSnackbarClose = (event, reason) => {
    if(reason !== 'clickaway') this.setState({ snackbar_success_open: false, snackbar_error_open: false });
  }

  /* Render-Method */
  render() {
    const { classes } = this.props;

    return (
      <Router>
        <Fragment>
          {/* Header */}
          <AppBar suggestions={this.state.suggestions} onChange={this.handleSearchChange("single")}/>
          {/* Main */}
          <main className={classes.main}>
            <Grid container style={{height: "100%"}}>
              <Grid item style={{width: 400}}>
                <LoginContainer logged_in={this.state.logged_in} sync_key={this.state.sync_key} favourites={this.state.favourites} own_sensors={this.state.own_sensors} onShowSensorData={this.onShowSensorDataDialog} onEditSensor={this.onShowEditSensorDialog} onRemoveSensor={this.onShowRemoveSensorDialog} onSensorDetails={this.onShowDetailsDialog} />
              </Grid>
              <Grid item>
                {this.state.markerData && <MapContainer google={window.google} logged_in={this.state.logged_in} ownPosition={this.state.currentPosition} markerData={this.state.markerData} favourites={this.state.favourites} own_sensors={this.state.own_sensors} onAddFavourite={this.onShowAddFavouriteDialog} onShowSensorData={this.onShowSensorDataDialog} style={{position: 'absolute', top: 0, bottom: 0}}/>}
              </Grid>
            </Grid>
            <Paper style={{margin: 0, paddingLeft: 10, paddingRight: 10, paddingTop: 3, paddingBottom: 3, right: 20, top: 80, position: "fixed", backgroundColor: 'rgba(255,255,255,0.5)', cursor: "pointer" }} onClick={() => window.open("https://h2801469.stratoserver.net/stats.php", "_blank")}>
              <Typography>{this.state.markerData.length} {strings.sensors}</Typography>
            </Paper>
            <Fab color="primary" aria-label={strings.add_sensor} style={{margin: 0, right: 20, bottom: 65, position: "fixed" }} onClick={this.onShowAddSensorDialog}><AddIcon/></Fab>
            { /* Dialogs */ }
            {this.state.dialog_add_sensor_open && <DialogAddSensor opened={this.state.dialog_add_sensor_open} onClose={this.onHideAddSensorDialog} onSensorAdded={this.props.onHideAddSensorDialog} user_data={this.state.user_data} sync_key={this.state.sync_key} logged_in={this.state.logged_in}/>}
            {this.state.selected_id !== undefined && this.state.dialog_add_favourite_open && <DialogAddFavourite opened={this.state.dialog_add_favourite_open} onClose={this.onHideAddFavouriteDialog} sync_key={this.state.sync_key} user_data={this.state.user_data} chip_id={this.state.selected_id} />}
            {this.state.selected !== undefined && this.state.dialog_sensor_data_open && <DialogSensorData opened={this.state.dialog_sensor_data_open} onClose={this.onHideSensorDataDialog} onOpenDetails={this.onShowDetailsDialog} sensor={this.state.selected} />}
            {this.state.selected !== undefined && this.state.dialog_edit_sensor_open && <DialogEditSensor opened={this.state.dialog_edit_sensor_open} sync_key={this.state.sync_key} data={this.state.user_data} onClose={this.onHideEditSensorDialog} chip_id={this.state.selected.chip_id} name={this.state.selected.name} fav={this.state.selected.fav} color={this.state.selected.color}/>}
            {this.state.selected_id !== undefined && this.state.dialog_remove_sensor_open && <DialogRemoveSensor opened={this.state.dialog_remove_sensor_open} sync_key={this.state.sync_key} user_data={this.state.user_data} onClose={this.onHideRemoveSensorDialog} chip_id={this.state.selected_id} />}
            {this.state.selected !== undefined && this.state.dialog_sensor_details_open && <DialogSensorDetails opened={this.state.dialog_sensor_details_open} chip_id={this.state.selected.chip_id} name={this.state.selected.name} onClose={this.onHideDetailsDialog} />}
            {/* URL-Parameter */}
            <Route path="/s/:id" render={(props) => (
              <DialogSensorData opened={this.state.dialog_sensor_data_route_open} onClose={this.onHideSensorDataDialog} onOpenDetails={this.onShowDetailsDialog} sensor={{chip_id: props.match.params.id, name: strings.unknown_sensor}} />
            )} />
            {/* Snackbars */}
            <Snackbar open={this.state.snackbar_success_open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000} onClose={this.onSnackbarClose}>
              <SnackbarContent
                message={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon style={{ fontSize: 20, opacity: 0.9, marginRight: 15 }}/>
                    {this.state.snackbar_message}
                  </span>}
                action={[
                  <IconButton key="success" color="inherit" onClick={this.onSnackbarClose}>
                    <CloseIcon style={{fontSize: 20}} />
                  </IconButton>,
                ]}
                style={{backgroundColor: green[600]}} />
            </Snackbar>
            <Snackbar open={this.state.snackbar_error_open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000} onClose={this.onSnackbarClose}>
              <SnackbarContent
                message={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon style={{ fontSize: 20, opacity: 0.9, marginRight: 15 }}/>
                    {this.state.snackbar_message}
                  </span>}
                action={[
                  <IconButton key="error" color="inherit" onClick={this.onSnackbarClose}>
                    <CloseIcon style={{fontSize: 20}} />
                  </IconButton>,
                ]}
                style={{backgroundColor: red[600]}} />
            </Snackbar>
          </main>
          {/* Footer */}
          <Grid container className={classes.footer}>
            <Typography variant="body2" color="inherit" style={{marginTop: 7}} noWrap>© M&amp;R Games&nbsp;&nbsp;-&nbsp;&nbsp;2018 - 2019</Typography>
            <Button variant="outlined" color="primary" href="https://mrgames13.jimdo.com" target="_blank" className={classes.button_homepage}>{strings.our_homepage}</Button>
            <Button variant="outlined" color="primary" href="https://mrgames13.jimdo.com/feinstaub-app/info/" target="_blank" className={classes.button_info}>{strings.info}</Button>
            <Button variant="outlined" color="secondary" href="https://play.google.com/store/apps/details?id=com.mrgames13.jimdo.feinstaubapp" target="_blank" className={classes.button_download}>{strings.download_android_app}</Button>
          </Grid>
        </Fragment>
      </Router>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(App);

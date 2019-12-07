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
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { CustomView, isAndroid } from "react-device-detect";
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
    right: 272,
  },
  button_homepage: {
    position: 'absolute',
    right: 344,
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

    if(isAndroid) {
      // Android-Geräte auf Playstore weiterleiten
      window.location = "https://play.app.goo.gl/?link=https://play.google.com/store/apps/details?id=com.mrgames13.jimdo.feinstaubapp"
    }

    return (
      <Router>
        <CustomView condition={isAndroid}>
            <div><p>Sie werden weitergeleitet ...</p></div>
        </CustomView>
        <CustomView condition={!isAndroid}>
          <Fragment>
            {/* Cover */}
            <div id="logo-container">
              <svg id="logo" width="1062" height="152" viewBox="0 0 1062 152" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M58.9256 11.632V22.288H15.2936V56.128H50.7176V66.784H15.2936V112H2.18958V11.632H58.9256Z" stroke="white" stroke-width="4"/>
                <path d="M146.752 69.52C146.752 72.016 146.608 74.656 146.32 77.44H83.2481C83.7281 85.216 86.3681 91.312 91.1681 95.728C96.0641 100.048 101.968 102.208 108.88 102.208C114.544 102.208 119.248 100.912 122.992 98.32C126.832 95.632 129.52 92.08 131.056 87.664H145.168C143.056 95.248 138.832 101.44 132.496 106.24C126.16 110.944 118.288 113.296 108.88 113.296C101.392 113.296 94.6721 111.616 88.7201 108.256C82.8641 104.896 78.2561 100.144 74.8961 94C71.5361 87.76 69.8561 80.56 69.8561 72.4C69.8561 64.24 71.4881 57.088 74.7521 50.944C78.0161 44.8 82.5761 40.096 88.4321 36.832C94.3841 33.472 101.2 31.792 108.88 31.792C116.368 31.792 122.992 33.424 128.752 36.688C134.512 39.952 138.928 44.464 142 50.224C145.168 55.888 146.752 62.32 146.752 69.52ZM133.216 66.784C133.216 61.792 132.112 57.52 129.904 53.968C127.696 50.32 124.672 47.584 120.832 45.76C117.088 43.84 112.912 42.88 108.304 42.88C101.68 42.88 96.0161 44.992 91.3121 49.216C86.7041 53.44 84.0641 59.296 83.3921 66.784H133.216Z" stroke="white" stroke-width="4"/>
                <path d="M170.817 20.272C168.321 20.272 166.209 19.408 164.481 17.68C162.753 15.952 161.889 13.84 161.889 11.344C161.889 8.84798 162.753 6.73599 164.481 5.00799C166.209 3.27999 168.321 2.41599 170.817 2.41599C173.217 2.41599 175.233 3.27999 176.865 5.00799C178.593 6.73599 179.457 8.84798 179.457 11.344C179.457 13.84 178.593 15.952 176.865 17.68C175.233 19.408 173.217 20.272 170.817 20.272ZM177.153 33.088V112H164.049V33.088H177.153Z" stroke="white" stroke-width="4"/>
                <path d="M237.934 31.648C247.534 31.648 255.31 34.576 261.262 40.432C267.214 46.192 270.19 54.544 270.19 65.488V112H257.23V67.36C257.23 59.488 255.262 53.488 251.326 49.36C247.39 45.136 242.014 43.024 235.198 43.024C228.286 43.024 222.766 45.184 218.638 49.504C214.606 53.824 212.59 60.112 212.59 68.368V112H199.486V33.088H212.59V44.32C215.182 40.288 218.686 37.168 223.102 34.96C227.614 32.752 232.558 31.648 237.934 31.648Z" stroke="white" stroke-width="4"/>
                <path d="M319.532 113.296C313.484 113.296 308.06 112.288 303.26 110.272C298.46 108.16 294.668 105.28 291.884 101.632C289.1 97.888 287.564 93.616 287.276 88.816H300.812C301.196 92.752 303.02 95.968 306.284 98.464C309.644 100.96 314.012 102.208 319.388 102.208C324.38 102.208 328.316 101.104 331.196 98.896C334.076 96.688 335.516 93.904 335.516 90.544C335.516 87.088 333.98 84.544 330.908 82.912C327.836 81.184 323.084 79.504 316.652 77.872C310.796 76.336 305.996 74.8 302.252 73.264C298.604 71.632 295.436 69.28 292.748 66.208C290.156 63.04 288.86 58.912 288.86 53.824C288.86 49.792 290.06 46.096 292.46 42.736C294.86 39.376 298.268 36.736 302.684 34.816C307.1 32.8 312.14 31.792 317.804 31.792C326.54 31.792 333.596 34 338.972 38.416C344.348 42.832 347.228 48.88 347.612 56.56H334.508C334.22 52.432 332.54 49.12 329.468 46.624C326.492 44.128 322.46 42.88 317.372 42.88C312.668 42.88 308.924 43.888 306.14 45.904C303.356 47.92 301.964 50.56 301.964 53.824C301.964 56.416 302.78 58.576 304.412 60.304C306.14 61.936 308.252 63.28 310.748 64.336C313.34 65.296 316.892 66.4 321.404 67.648C327.068 69.184 331.676 70.72 335.228 72.256C338.78 73.696 341.804 75.904 344.3 78.88C346.892 81.856 348.236 85.744 348.332 90.544C348.332 94.864 347.132 98.752 344.732 102.208C342.332 105.664 338.924 108.4 334.508 110.416C330.188 112.336 325.196 113.296 319.532 113.296Z" stroke="white" stroke-width="4"/>
                <path d="M382.814 43.888V90.4C382.814 94.24 383.63 96.976 385.262 98.608C386.894 100.144 389.726 100.912 393.758 100.912H403.406V112H391.598C384.302 112 378.83 110.32 375.182 106.96C371.534 103.6 369.71 98.08 369.71 90.4V43.888H359.486V33.088H369.71V13.216H382.814V33.088H403.406V43.888H382.814Z" stroke="white" stroke-width="4"/>
                <path d="M414.387 72.256C414.387 64.192 416.019 57.136 419.283 51.088C422.547 44.944 427.011 40.192 432.675 36.832C438.435 33.472 444.819 31.792 451.827 31.792C458.739 31.792 464.739 33.28 469.827 36.256C474.915 39.232 478.707 42.976 481.203 47.488V33.088H494.451V112H481.203V97.312C478.611 101.92 474.723 105.76 469.539 108.832C464.451 111.808 458.499 113.296 451.683 113.296C444.675 113.296 438.339 111.568 432.675 108.112C427.011 104.656 422.547 99.808 419.283 93.568C416.019 87.328 414.387 80.224 414.387 72.256ZM481.203 72.4C481.203 66.448 480.003 61.264 477.603 56.848C475.203 52.432 471.939 49.072 467.811 46.768C463.779 44.368 459.315 43.168 454.419 43.168C449.523 43.168 445.059 44.32 441.027 46.624C436.995 48.928 433.779 52.288 431.379 56.704C428.979 61.12 427.779 66.304 427.779 72.256C427.779 78.304 428.979 83.584 431.379 88.096C433.779 92.512 436.995 95.92 441.027 98.32C445.059 100.624 449.523 101.776 454.419 101.776C459.315 101.776 463.779 100.624 467.811 98.32C471.939 95.92 475.203 92.512 477.603 88.096C480.003 83.584 481.203 78.352 481.203 72.4Z" stroke="white" stroke-width="4"/>
                <path d="M586.58 33.088V112H573.476V100.336C570.98 104.368 567.476 107.536 562.964 109.84C558.548 112.048 553.652 113.152 548.276 113.152C542.132 113.152 536.612 111.904 531.716 109.408C526.82 106.816 522.932 102.976 520.052 97.888C517.268 92.8 515.876 86.608 515.876 79.312V33.088H528.836V77.584C528.836 85.36 530.804 91.36 534.74 95.584C538.676 99.712 544.052 101.776 550.868 101.776C557.876 101.776 563.396 99.616 567.428 95.296C571.46 90.976 573.476 84.688 573.476 76.432V33.088H586.58Z" stroke="white" stroke-width="4"/>
                <path d="M621.809 47.776C624.497 43.072 628.433 39.232 633.617 36.256C638.801 33.28 644.705 31.792 651.329 31.792C658.433 31.792 664.817 33.472 670.481 36.832C676.145 40.192 680.609 44.944 683.873 51.088C687.137 57.136 688.769 64.192 688.769 72.256C688.769 80.224 687.137 87.328 683.873 93.568C680.609 99.808 676.097 104.656 670.337 108.112C664.673 111.568 658.337 113.296 651.329 113.296C644.513 113.296 638.513 111.808 633.329 108.832C628.241 105.856 624.401 102.064 621.809 97.456V112H608.705V5.43999H621.809V47.776ZM675.377 72.256C675.377 66.304 674.177 61.12 671.777 56.704C669.377 52.288 666.113 48.928 661.985 46.624C657.953 44.32 653.489 43.168 648.593 43.168C643.793 43.168 639.329 44.368 635.201 46.768C631.169 49.072 627.905 52.48 625.409 56.992C623.009 61.408 621.809 66.544 621.809 72.4C621.809 78.352 623.009 83.584 625.409 88.096C627.905 92.512 631.169 95.92 635.201 98.32C639.329 100.624 643.793 101.776 648.593 101.776C653.489 101.776 657.953 100.624 661.985 98.32C666.113 95.92 669.377 92.512 671.777 88.096C674.177 83.584 675.377 78.304 675.377 72.256Z" stroke="white" stroke-width="4"/>
                <path d="M760.738 53.68V64.768H703.282V53.68H760.738Z" stroke="white" stroke-width="4"/>
                <path d="M844.658 89.68H800.882L792.818 112H778.994L815.282 12.208H830.402L866.546 112H852.722L844.658 89.68ZM840.914 79.024L822.77 28.336L804.626 79.024H840.914Z" stroke="white" stroke-width="4"/>
                <path d="M895.465 47.632C898.057 43.12 901.897 39.376 906.985 36.4C912.169 33.328 918.169 31.792 924.985 31.792C931.993 31.792 938.329 33.472 943.993 36.832C949.753 40.192 954.265 44.944 957.529 51.088C960.793 57.136 962.425 64.192 962.425 72.256C962.425 80.224 960.793 87.328 957.529 93.568C954.265 99.808 949.753 104.656 943.993 108.112C938.329 111.568 931.993 113.296 924.985 113.296C918.265 113.296 912.313 111.808 907.129 108.832C902.041 105.76 898.153 101.968 895.465 97.456V149.44H882.361V33.088H895.465V47.632ZM949.033 72.256C949.033 66.304 947.833 61.12 945.433 56.704C943.033 52.288 939.769 48.928 935.641 46.624C931.609 44.32 927.145 43.168 922.249 43.168C917.449 43.168 912.985 44.368 908.857 46.768C904.825 49.072 901.561 52.48 899.065 56.992C896.665 61.408 895.465 66.544 895.465 72.4C895.465 78.352 896.665 83.584 899.065 88.096C901.561 92.512 904.825 95.92 908.857 98.32C912.985 100.624 917.449 101.776 922.249 101.776C927.145 101.776 931.609 100.624 935.641 98.32C939.769 95.92 943.033 92.512 945.433 88.096C947.833 83.584 949.033 78.304 949.033 72.256Z" stroke="white" stroke-width="4"/>
                <path d="M992.778 47.632C995.37 43.12 999.21 39.376 1004.3 36.4C1009.48 33.328 1015.48 31.792 1022.3 31.792C1029.31 31.792 1035.64 33.472 1041.31 36.832C1047.07 40.192 1051.58 44.944 1054.84 51.088C1058.11 57.136 1059.74 64.192 1059.74 72.256C1059.74 80.224 1058.11 87.328 1054.84 93.568C1051.58 99.808 1047.07 104.656 1041.31 108.112C1035.64 111.568 1029.31 113.296 1022.3 113.296C1015.58 113.296 1009.63 111.808 1004.44 108.832C999.354 105.76 995.466 101.968 992.778 97.456V149.44H979.674V33.088H992.778V47.632ZM1046.35 72.256C1046.35 66.304 1045.15 61.12 1042.75 56.704C1040.35 52.288 1037.08 48.928 1032.95 46.624C1028.92 44.32 1024.46 43.168 1019.56 43.168C1014.76 43.168 1010.3 44.368 1006.17 46.768C1002.14 49.072 998.874 52.48 996.378 56.992C993.978 61.408 992.778 66.544 992.778 72.4C992.778 78.352 993.978 83.584 996.378 88.096C998.874 92.512 1002.14 95.92 1006.17 98.32C1010.3 100.624 1014.76 101.776 1019.56 101.776C1024.46 101.776 1028.92 100.624 1032.95 98.32C1037.08 95.92 1040.35 92.512 1042.75 88.096C1045.15 83.584 1046.35 78.304 1046.35 72.256Z" stroke="white" stroke-width="4"/>
              </svg>
            </div>
            <div id="app-container">
              {/* Header */}
              <AppBar suggestions={this.state.suggestions} onChange={this.handleSearchChange("single")}/>
              {/* Main */}
              <main className={classes.main}>
                <Grid container style={{height: "100%"}}>
                  <Grid item style={{width: 400}}>
                    <LoginContainer logged_in={this.state.logged_in} sync_key={this.state.sync_key} favourites={this.state.favourites} own_sensors={this.state.own_sensors} onShowSensorData={this.onShowSensorDataDialog} onEditSensor={this.onShowEditSensorDialog} onRemoveSensor={this.onShowRemoveSensorDialog} onSensorDetails={this.onShowDetailsDialog} />
                  </Grid>
                  <Grid item>
                    {this.state.markerData && <MapContainer google={window.google} logged_in={this.state.logged_in} ownPosition={this.state.currentPosition} markerData={this.state.markerData} favourites={this.state.favourites} own_sensors={this.state.own_sensors} onAddFavourite={this.onShowAddFavouriteDialog} onShowSensorData={this.onShowSensorDataDialog} onOpenDetails={this.onShowDetailsDialog} style={{position: 'absolute', top: 0, bottom: 0}}/>}
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
                <Switch>
                  <Route path="/s/:id" render={(props) => (
                    <DialogSensorData opened={this.state.dialog_sensor_data_route_open} onClose={this.onHideSensorDataDialog} onOpenDetails={this.onShowDetailsDialog} sensor={{chip_id: props.match.params.id, name: strings.unknown_sensor}} />
                  )} />
                  <Redirect strict from={'/'} to={"."} />
                </Switch>
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
                <Typography variant="body2" color="inherit" style={{marginTop: 7}} noWrap>© M&amp;R Games&nbsp;&nbsp;-&nbsp;&nbsp;2018 - {new Date().getFullYear()}</Typography>
                <Button variant="outlined" color="primary" href="https://mrgames13.jimdo.com" target="_blank" className={classes.button_homepage}>{strings.our_homepage}</Button>
                <Button variant="outlined" color="primary" href="https://mrgames13.jimdo.com/feinstaub-app/info/" target="_blank" className={classes.button_info}>{strings.info}</Button>
                <Button variant="contained" color="secondary" href="https://play.google.com/store/apps/details?id=com.mrgames13.jimdo.feinstaubapp" target="_blank" className={classes.button_download}>{strings.download_android_app}</Button>
              </Grid>
            </div>
          </Fragment>
        </CustomView>
      </Router>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(App);
